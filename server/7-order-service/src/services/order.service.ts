import { config } from '@order/config';
import { DisputeModel } from '@order/models/dispute.schema';
import { OrderModel } from '@order/models/order.schema';
import { publishDirectMessage } from '@order/queues/order.producer';
import { orderChannel } from '@order/server';
import {
  BadRequestError,
  IDeliveredWork,
  IExtendedDelivery,
  IOrderDocument,
  IOrderMessage,
  IReviewMessageDetails,
  lowerCase
} from '@19010853/ithust-shared';
import { sendNotification } from '@order/services/notification.service';
import { processOverdueRefunds, refundHeldOrderToOriginalSource } from '@order/services/refund.service';

const ACTIVE_ORDER_STATUSES = ['IN_PROGRESS', 'in progress', 'In Progress'];
const DELIVERABLE_ORDER_STATUSES = [...ACTIVE_ORDER_STATUSES, 'Delivered', 'delivered', 'REVISION_REQUIRED'];
const APPROVABLE_ORDER_STATUSES = ['Delivered', 'delivered', 'DISPUTED'];

export const getOrderByOrderId = async (orderId: string): Promise<IOrderDocument> => {
  void processOverdueRefunds().catch(() => undefined);
  const order: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { orderId } }])) as IOrderDocument[];
  return order[0];
};

export const getOrdersBySellerId = async (sellerId: string): Promise<IOrderDocument[]> => {
  void processOverdueRefunds().catch(() => undefined);
  const orders: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { sellerId } }])) as IOrderDocument[];
  return orders;
};

export const getOrdersByBuyerId = async (buyerId: string): Promise<IOrderDocument[]> => {
  void processOverdueRefunds().catch(() => undefined);
  const orders: IOrderDocument[] = (await OrderModel.aggregate([{ $match: { buyerId } }])) as IOrderDocument[];
  return orders;
};

export const createOrder = async (data: IOrderDocument): Promise<IOrderDocument> => {
  const order: IOrderDocument = await OrderModel.create(data);
  return order;
};

export const activatePaidOrder = async (
  mongoOrderId: string,
  provider: 'stripe',
  providerChargeId: string,
  providerEventId: string
): Promise<{ order: IOrderDocument | null; activated: boolean }> => {
  const order = (await OrderModel.findOneAndUpdate(
    { _id: mongoOrderId, paymentProvider: provider, paymentStatus: 'PENDING', status: 'PENDING_PAYMENT' },
    {
      $set: {
        status: 'IN_PROGRESS',
        paymentStatus: 'HELD',
        paymentTransactionId: providerEventId,
        providerChargeId,
        ['events.orderStarted']: new Date()
      }
    },
    { new: true }
  ).exec()) as IOrderDocument | null;

  if (!order) {
    const existing = (await OrderModel.findById(mongoOrderId).exec()) as IOrderDocument | null;
    return { order: existing, activated: false };
  }

  const messageDetails: IOrderMessage = {
    sellerId: order.sellerId,
    ongoingJobs: 1,
    type: 'create-order'
  };
  // update seller info
  await publishDirectMessage(
    orderChannel,
    'ithust-seller-update',
    'user-seller',
    JSON.stringify(messageDetails),
    'Details sent to users service'
  );
  const emailMessageDetails: IOrderMessage = {
    orderId: order.orderId,
    invoiceId: order.invoiceId,
    orderDue: `${order.offer.newDeliveryDate}`,
    amount: `${order.price}`,
    buyerUsername: lowerCase(order.buyerUsername),
    sellerUsername: lowerCase(order.sellerUsername),
    title: order.offer.gigTitle,
    description: order.offer.description,
    requirements: order.requirements,
    serviceFee: `${order.serviceFee}`,
    total: `${order.price + order.serviceFee!}`,
    orderUrl: `${config.CLIENT_URL}/orders/${order.orderId}/activities`,
    template: 'orderPlaced'
  };
  // send email
  await publishDirectMessage(
    orderChannel,
    'ithust-order-notification',
    'order-email',
    JSON.stringify(emailMessageDetails),
    'Order email sent to notification service.'
  );
  sendNotification(order, order.sellerUsername, 'placed an order for your gig.');
  return { order, activated: true };
};

export const cancelOrder = async (orderId: string, data: IOrderMessage): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId },
    {
      $set: {
        cancelled: true,
        status: 'Cancelled',
        approvedAt: new Date()
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;
  // update seller info
  await publishDirectMessage(
    orderChannel,
    'ithust-seller-update',
    'user-seller',
    JSON.stringify({ type: 'cancel-order', sellerId: data.sellerId }),
    'Cancelled order details sent to users service.'
  );
  // update buyer info
  await publishDirectMessage(
    orderChannel,
    'ithust-buyer-update',
    'user-buyer',
    JSON.stringify({ type: 'cancel-order', buyerId: data.buyerId, purchasedGigs: data.purchasedGigs }),
    'Cancelled order details sent to users service.'
  );
  sendNotification(order, order.sellerUsername, 'cancelled your order delivery.');
  return order;
};

export const approveOrder = async (orderId: string, data: IOrderMessage, allowDisputed = false): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    {
      orderId,
      paymentStatus: 'HELD',
      status: { $in: allowDisputed ? APPROVABLE_ORDER_STATUSES : ['Delivered', 'delivered'] },
      delivered: true,
      approved: false,
      cancelled: { $ne: true }
    },
    {
      $set: {
        approved: true,
        status: 'Completed',
        paymentStatus: 'RELEASED',
        approvedAt: new Date()
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;
  if (!order) {
    throw new BadRequestError('Order cannot be approved because funds are not held or delivery is not ready.', 'approveOrder()');
  }
  // Funds are released, so any dispute still awaiting a decision can no longer be acted on — close it.
  // The admin RELEASE_SELLER path overwrites this status with its own right after.
  await DisputeModel.updateMany(
    { orderId, status: { $in: ['OPEN', 'SELLER_RESPONSE_REQUIRED', 'REVISION_REQUIRED'] } },
    { $set: { status: 'CLOSED', decisionReason: 'Buyer đã duyệt bàn giao nên tranh chấp được đóng tự động.', decidedAt: new Date() } }
  ).exec();
  const messageDetails: IOrderMessage = {
    sellerId: data.sellerId,
    buyerId: data.buyerId,
    ongoingJobs: data.ongoingJobs,
    completedJobs: data.completedJobs,
    totalEarnings: data.totalEarnings, // this is the price the seller earned for lastest order delivered
    recentDelivery: `${new Date()}`,
    type: 'approve-order'
  };
  // update seller info
  await publishDirectMessage(
    orderChannel,
    'ithust-seller-update',
    'user-seller',
    JSON.stringify(messageDetails),
    'Approved order details sent to users service.'
  );
  // update buyer info
  await publishDirectMessage(
    orderChannel,
    'ithust-buyer-update',
    'user-buyer',
    JSON.stringify({ type: 'purchased-gigs', buyerId: data.buyerId, purchasedGigs: data.purchasedGigs }),
    'Approved order details sent to users service.'
  );
  sendNotification(order, order.sellerUsername, 'approved your order delivery.');
  return order;
};

export const sellerDeliverOrder = async (orderId: string, delivered: boolean, deliveredWork: IDeliveredWork): Promise<IOrderDocument> => {
  await processOverdueRefunds();
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    {
      orderId,
      paymentStatus: 'HELD',
      status: { $in: DELIVERABLE_ORDER_STATUSES },
      approved: false,
      cancelled: { $ne: true },
      'offer.newDeliveryDate': { $gt: new Date() }
    },
    {
      $set: {
        delivered,
        status: 'Delivered',
        ['events.orderDelivered']: new Date()
      },
      $push: {
        deliveredWork
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;
  if (!order) {
    throw new BadRequestError('Order cannot be delivered because funds are not held or the order is closed.', 'sellerDeliverOrder()');
  }
  if (order) {
    const messageDetails: IOrderMessage = {
      orderId,
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      title: order.offer.gigTitle,
      description: order.offer.description,
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderDelivered'
    };
    // send email
    await publishDirectMessage(
      orderChannel,
      'ithust-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order delivered message sent to notification service.'
    );
    sendNotification(order, order.buyerUsername, 'delivered your order.');
  }
  return order;
};

export const requestDeliveryExtension = async (orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> => {
  const { newDate, days, reason, originalDate } = data;
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    {
      orderId,
      paymentStatus: 'HELD',
      status: { $in: ACTIVE_ORDER_STATUSES },
      approved: false,
      delivered: false,
      cancelled: { $ne: true },
      'offer.newDeliveryDate': { $gt: new Date() }
    },
    {
      $set: {
        ['requestExtension.originalDate']: originalDate,
        ['requestExtension.newDate']: newDate,
        ['requestExtension.days']: days,
        ['requestExtension.reason']: reason
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;
  if (!order) {
    throw new BadRequestError('Order delivery date can only be extended for active held orders before the current deadline.', 'requestDeliveryExtension()');
  }
  if (order) {
    const messageDetails: IOrderMessage = {
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      originalDate: order.offer.oldDeliveryDate,
      newDate: order.offer.newDeliveryDate,
      reason: order.offer.reason,
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtension'
    };
    // send email
    await publishDirectMessage(
      orderChannel,
      'ithust-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order delivered message sent to notification service.'
    );
    sendNotification(order, order.buyerUsername, 'requested for an order delivery date extension.');
  }
  return order;
};

export const approveDeliveryDate = async (orderId: string, data: IExtendedDelivery): Promise<IOrderDocument> => {
  const { newDate, days, reason, deliveryDateUpdate } = data;
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    {
      orderId,
      paymentStatus: 'HELD',
      status: { $in: ACTIVE_ORDER_STATUSES },
      approved: false,
      delivered: false,
      cancelled: { $ne: true },
      'requestExtension.newDate': { $ne: '' }
    },
    {
      $set: {
        ['offer.deliveryInDays']: days,
        ['offer.newDeliveryDate']: newDate,
        ['offer.reason']: reason,
        ['events.deliveryDateUpdate']: new Date(`${deliveryDateUpdate}`),
        requestExtension: {
          originalDate: '',
          newDate: '',
          days: 0,
          reason: ''
        }
      }
    },
    { new: true }
  ).exec()) as IOrderDocument;
  if (!order) {
    throw new BadRequestError('Order delivery extension cannot be approved for this order.', 'approveDeliveryDate()');
  }
  if (order) {
    const messageDetails: IOrderMessage = {
      subject: 'Congratulations: Your extension request was approved',
      buyerUsername: lowerCase(order.buyerUsername),
      sellerUsername: lowerCase(order.sellerUsername),
      header: 'Request Accepted',
      type: 'accepted',
      message: 'You can continue working on the order.',
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtensionApproval'
    };
    // send email
    await publishDirectMessage(
      orderChannel,
      'ithust-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order request extension approval message sent to notification service.'
    );
    sendNotification(order, order.sellerUsername, 'approved your order delivery date extension request.');
  }
  return order;
};

export const rejectDeliveryDate = async (orderId: string): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await OrderModel.findOne(
    {
      orderId,
      paymentStatus: 'HELD',
      status: { $in: ACTIVE_ORDER_STATUSES },
      approved: false,
      delivered: false,
      cancelled: { $ne: true },
      'requestExtension.newDate': { $ne: '' }
    },
  ).exec()) as IOrderDocument;
  if (!order) {
    throw new BadRequestError('Order delivery extension cannot be rejected for this order.', 'rejectDeliveryDate()');
  }
  await refundHeldOrderToOriginalSource(
    order,
    'Buyer rejected the seller delivery extension request.',
    'EXTENSION_REJECTED',
    'BUYER'
  );
  const updatedOrder = ((await OrderModel.findOne({ orderId }).exec()) as IOrderDocument) || order;
  if (updatedOrder) {
    const messageDetails: IOrderMessage = {
      subject: 'Sorry: Your extension request was rejected',
      buyerUsername: lowerCase(updatedOrder.buyerUsername),
      sellerUsername: lowerCase(updatedOrder.sellerUsername),
      header: 'Request Rejected',
      type: 'rejected',
      message: 'The buyer rejected the extension request. The order payment is being refunded to the original payment method.',
      orderUrl: `${config.CLIENT_URL}/orders/${orderId}/activities`,
      template: 'orderExtensionApproval'
    };
    // send email
    await publishDirectMessage(
      orderChannel,
      'ithust-order-notification',
      'order-email',
      JSON.stringify(messageDetails),
      'Order request extension rejection message sent to notification service.'
    );
    sendNotification(updatedOrder, updatedOrder.sellerUsername, 'rejected your order delivery date extension request.');
  }
  return updatedOrder;
};

export const updateOrderReview = async (data: IReviewMessageDetails): Promise<IOrderDocument> => {
  const order: IOrderDocument = (await OrderModel.findOneAndUpdate(
    { orderId: data.orderId },
    {
      $set:
        data.type === 'buyer-review'
          ? {
              buyerReview: {
                rating: data.rating,
                review: data.review,
                created: new Date(`${data.createdAt}`)
              },
              ['events.buyerReview']: new Date(`${data.createdAt}`)
            }
          : {
              sellerReview: {
                rating: data.rating,
                review: data.review,
                created: new Date(`${data.createdAt}`)
              },
              ['events.sellerReview']: new Date(`${data.createdAt}`)
            }
    },
    { new: true }
  ).exec()) as IOrderDocument;
  sendNotification(
    order,
    data.type === 'buyer-review' ? order.sellerUsername : order.buyerUsername,
    `left you a ${data.rating} star review`
  );
  return order;
};
