import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';
import { config } from '@order/config';
import { DisputeModel } from '@order/models/dispute.schema';
import { OrderModel } from '@order/models/order.schema';
import { IRefundRequestDocument, RefundRequestModel } from '@order/models/refund-request.schema';
import { publishDirectMessage } from '@order/queues/order.producer';
import { orderChannel } from '@order/server';
import { emitOrderUpdate, sendNotification } from '@order/services/notification.service';
import { refundStripePaymentIntent } from '@order/services/stripe.service';

interface IRefundRequestPayload {
  reason: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
}

type RefundTrigger = 'BUYER_REQUEST' | 'EXTENSION_REJECTED' | 'OVERDUE_AUTO' | 'QUALITY_DISPUTE';
type RefundDecisionSource = 'BUYER' | 'ADMIN' | 'POLICY';

type PaidOrderDocument = IOrderDocument & {
  _id?: unknown;
  paymentAmountVnd?: number;
  paymentStatus?: string;
  paymentProvider?: string;
  providerPaymentId?: string;
  refundedAt?: Date;
};

const ACTIVE_ORDER_STATUSES = ['IN_PROGRESS', 'in progress', 'In Progress', 'REVISION_REQUIRED'];
const emptyBankInfo = {
  bankName: '',
  accountNumber: '',
  accountName: ''
};

const normalizeBankInfo = (bankInfo?: {
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
}): typeof emptyBankInfo => ({
  bankName: bankInfo?.bankName || '',
  accountNumber: bankInfo?.accountNumber || '',
  accountName: bankInfo?.accountName || ''
});

const hasPendingExtensionRequest = (order: PaidOrderDocument): boolean => Boolean(order.requestExtension?.newDate);

const isBeforeDeliveryDeadline = (order: PaidOrderDocument): boolean => {
  const deadline = new Date(`${order.offer?.newDeliveryDate || ''}`).getTime();
  return Number.isFinite(deadline) && deadline > Date.now();
};

const assertStripeRefundableOrder = (order: PaidOrderDocument, source: string): void => {
  if (order.approved || order.paymentStatus !== 'HELD' || !order.paymentAmountVnd) {
    throw new BadRequestError('Refund is only available for paid orders still held by the platform.', source);
  }
  if (order.paymentProvider !== 'stripe' || !order.providerPaymentId) {
    throw new BadRequestError('Automatic refund is only available for Stripe orders.', source);
  }
};

const publishRefundedSellerUpdate = async (order: PaidOrderDocument): Promise<void> => {
  await publishDirectMessage(
    orderChannel,
    'ithust-seller-update',
    'user-seller',
    JSON.stringify({ type: 'refund-order', sellerId: order.sellerId, ongoingJobs: -1 }),
    'Refunded order details sent to users service.'
  );
};

const publishRefundStatusEmail = async (order: PaidOrderDocument, refundRequest: IRefundRequestDocument): Promise<void> => {
  await publishDirectMessage(
    orderChannel,
    'ithust-order-notification',
    'order-email',
    JSON.stringify({
      receiverEmail: order.buyerEmail,
      template: 'refundStatus',
      recipientUsername: order.buyerUsername,
      buyerUsername: order.buyerUsername,
      orderId: order.orderId,
      amount: `${order.paymentAmountVnd} VND`,
      paymentProvider: 'Stripe',
      refundRequestId: `${refundRequest._id || ''}`,
      orderUrl: `${config.CLIENT_URL}/orders/${order.orderId}/activities`
    }),
    'Refund status email sent to notification service.'
  );
};

const findOrCreateRefundRequest = async (
  order: PaidOrderDocument,
  reason: string,
  trigger: RefundTrigger,
  decisionSource: RefundDecisionSource,
  bankInfo = emptyBankInfo
): Promise<IRefundRequestDocument> => {
  const existingRefund = await RefundRequestModel.findOne({ orderId: order.orderId }).exec();
  if (existingRefund) {
    if (existingRefund.status === 'COMPLETED' || existingRefund.status === 'PROCESSING') {
      return existingRefund;
    }
    await RefundRequestModel.updateOne(
      { _id: existingRefund._id },
      {
        $set: {
          reason,
          trigger,
          decisionSource,
          settlementMode: config.REFUND_SETTLEMENT_MODE,
          status: 'PROCESSING',
          failureReason: ''
        }
      }
    ).exec();
    return (await RefundRequestModel.findById(existingRefund._id).exec()) as IRefundRequestDocument;
  }

  return RefundRequestModel.create({
    orderId: order.orderId,
    orderMongoId: `${order._id || ''}`,
    buyerId: order.buyerId,
    buyerUsername: order.buyerUsername,
    buyerEmail: order.buyerEmail,
    paidAmountVnd: order.paymentAmountVnd,
    reason,
    bankInfo,
    status: 'PROCESSING',
    trigger,
    decisionSource,
    settlementMode: config.REFUND_SETTLEMENT_MODE
  });
};

export const completeRefundedOrder = async (orderId: string): Promise<PaidOrderDocument | null> => {
  const refundedAt = new Date();
  const order = (await OrderModel.findOneAndUpdate(
    {
      orderId,
      paymentStatus: { $in: ['HELD', 'REFUND_PROCESSING'] },
      status: { $ne: 'REFUNDED' }
    },
    {
      $set: {
        paymentStatus: 'REFUNDED',
        status: 'REFUNDED',
        delivered: false,
        approved: false,
        refundedAt,
        requestExtension: {
          originalDate: '',
          newDate: '',
          days: 0,
          reason: ''
        }
      }
    },
    { new: true }
  ).exec()) as unknown as PaidOrderDocument | null;

  if (order) {
    // Funds went back to the buyer, so a dispute still awaiting a decision has nothing left to decide — close it.
    // The admin REFUND_BUYER path overwrites this status with its own right after.
    await DisputeModel.updateMany(
      { orderId, status: { $in: ['OPEN', 'SELLER_RESPONSE_REQUIRED', 'REVISION_REQUIRED'] } },
      { $set: { status: 'CLOSED', decisionReason: 'Đơn hàng đã được hoàn tiền nên tranh chấp được đóng tự động.', decidedAt: new Date() } }
    ).exec();
    await publishRefundedSellerUpdate(order);
    await emitOrderUpdate(order);
    await sendNotification(order, order.buyerUsername, 'đã hoàn tiền cho đơn hàng của bạn.');
  }

  return order;
};

export const refundHeldOrderToOriginalSource = async (
  order: PaidOrderDocument,
  reason: string,
  trigger: RefundTrigger,
  decisionSource: RefundDecisionSource,
  bankInfo = emptyBankInfo
): Promise<IRefundRequestDocument> => {
  assertStripeRefundableOrder(order, 'refundHeldOrderToOriginalSource()');

  const refundRequest = await findOrCreateRefundRequest(order, reason, trigger, decisionSource, bankInfo);
  if (refundRequest.status === 'COMPLETED') {
    return refundRequest;
  }

  const processingOrder = (await OrderModel.findOneAndUpdate(
    { orderId: order.orderId, paymentStatus: { $in: ['HELD', 'REFUND_PROCESSING'] }, approved: false, cancelled: { $ne: true } },
    { $set: { paymentStatus: 'REFUND_PROCESSING' } },
    { new: true }
  ).exec()) as unknown as PaidOrderDocument | null;
  if (!processingOrder) {
    throw new BadRequestError('Order funds are no longer held.', 'refundHeldOrderToOriginalSource()');
  }
  await emitOrderUpdate(processingOrder);

  try {
    const providerRefund = await refundStripePaymentIntent(`${order.providerPaymentId}`, `refund-${refundRequest._id}`);
    await RefundRequestModel.updateOne(
      { _id: refundRequest._id },
      {
        $set: {
          providerRefundId: providerRefund.id,
          status: providerRefund.status === 'succeeded' ? 'COMPLETED' : 'PROCESSING',
          processedAt: new Date(),
          settlementMode: config.REFUND_SETTLEMENT_MODE
        }
      }
    ).exec();
    if (providerRefund.status === 'succeeded') {
      const refundedOrder = await completeRefundedOrder(order.orderId);
      await publishRefundStatusEmail(refundedOrder || processingOrder, refundRequest);
    }
  } catch (error) {
    await RefundRequestModel.updateOne(
      { _id: refundRequest._id },
      { $set: { status: 'FAILED', failureReason: error instanceof Error ? error.message : 'Stripe refund failed.' } }
    ).exec();
    const restoredOrder = (await OrderModel.findOneAndUpdate(
      { orderId: order.orderId, paymentStatus: 'REFUND_PROCESSING' },
      { $set: { paymentStatus: 'HELD' } },
      { new: true }
    ).exec()) as unknown as PaidOrderDocument | null;
    if (restoredOrder) {
      await emitOrderUpdate(restoredOrder);
    }
    throw error;
  }

  return (await RefundRequestModel.findById(refundRequest._id).exec()) as IRefundRequestDocument;
};

export const completeStripeRefundForPaymentIntent = async (
  providerPaymentId: string
): Promise<{ order: PaidOrderDocument | null; completed: boolean }> => {
  const existingOrder = (await OrderModel.findOne({ providerPaymentId, paymentProvider: 'stripe' }).exec()) as unknown as PaidOrderDocument | null;
  if (!existingOrder) {
    return { order: null, completed: false };
  }

  const completedOrder = await completeRefundedOrder(existingOrder.orderId);
  if (completedOrder) {
    const refundRequest = (await RefundRequestModel.findOneAndUpdate(
      { orderId: completedOrder.orderId },
      { $set: { status: 'COMPLETED', processedAt: new Date(), settlementMode: config.REFUND_SETTLEMENT_MODE } },
      { new: true }
    ).exec()) as IRefundRequestDocument | null;
    if (refundRequest) {
      await publishRefundStatusEmail(completedOrder, refundRequest);
    }
  }
  return { order: completedOrder || existingOrder, completed: Boolean(completedOrder) };
};

export const createRefundRequest = async (
  orderId: string,
  requesterUsername: string,
  data: IRefundRequestPayload
): Promise<IRefundRequestDocument> => {
  const order = (await OrderModel.findOne({ orderId }).exec()) as unknown as PaidOrderDocument;

  if (!order) {
    throw new BadRequestError('Order not found.', 'createRefundRequest()');
  }

  if (!requesterUsername || order.buyerUsername !== requesterUsername) {
    throw new BadRequestError('Only the buyer can request a refund for this order.', 'createRefundRequest()');
  }

  assertStripeRefundableOrder(order, 'createRefundRequest()');

  if (!hasPendingExtensionRequest(order) || !isBeforeDeliveryDeadline(order) || order.delivered) {
    throw new BadRequestError(
      'Buyer refund is only available while rejecting a pending delivery extension request. Overdue orders are refunded automatically and quality refunds must go through admin dispute review.',
      'createRefundRequest()'
    );
  }

  const refund = await refundHeldOrderToOriginalSource(
    order,
    data.reason,
    'EXTENSION_REJECTED',
    'BUYER',
    normalizeBankInfo(data.bankInfo)
  );

  const receiverEmail = process.env.PLATFORM_OWNER_EMAIL || '';
  if (receiverEmail) {
    await publishDirectMessage(
      orderChannel,
      'ithust-order-notification',
      'order-email',
      JSON.stringify({
        receiverEmail,
        template: 'refundRequest',
        buyerUsername: order.buyerUsername,
        buyerEmail: order.buyerEmail,
        orderId: order.orderId,
        amount: `${order.paymentAmountVnd} VND`,
        reason: data.reason,
        settlementMode: config.REFUND_SETTLEMENT_MODE,
        paymentProvider: 'Stripe',
        refundRequestId: `${refund._id || ''}`,
        orderUrl: `${config.CLIENT_URL}/orders/${order.orderId}/activities`
      }),
      'Refund request email sent to notification service.'
    );
  }

  return refund;
};

export const creditApprovedRefund = async (
  order: PaidOrderDocument,
  refundRequest: IRefundRequestDocument,
  _decisionSource: 'ADMIN' | 'POLICY',
  _actor?: unknown
): Promise<IRefundRequestDocument> => {
  return refundHeldOrderToOriginalSource(
    order,
    refundRequest.reason,
    refundRequest.trigger || 'QUALITY_DISPUTE',
    refundRequest.decisionSource || _decisionSource,
    normalizeBankInfo(refundRequest.bankInfo)
  );
};

export const processOverdueRefunds = async (limit = 25): Promise<{ scanned: number; refunded: number; failed: number }> => {
  const overdueOrders = (await OrderModel.find({
    paymentStatus: 'HELD',
    approved: false,
    delivered: false,
    cancelled: { $ne: true },
    status: { $in: ACTIVE_ORDER_STATUSES },
    paymentProvider: 'stripe',
    providerPaymentId: { $ne: '' },
    'offer.newDeliveryDate': { $lt: new Date() }
  })
    .limit(limit)
    .exec()) as unknown as PaidOrderDocument[];

  let refunded = 0;
  let failed = 0;
  for (const order of overdueOrders) {
    try {
      await refundHeldOrderToOriginalSource(
        order,
        'Đơn hàng đã quá hạn hoàn thiện nhưng seller chưa bàn giao.',
        'OVERDUE_AUTO',
        'POLICY'
      );
      refunded += 1;
    } catch {
      failed += 1;
    }
  }

  return { scanned: overdueOrders.length, refunded, failed };
};
