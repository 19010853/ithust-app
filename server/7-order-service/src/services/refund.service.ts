import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';
import { config } from '@order/config';
import { OrderModel } from '@order/models/order.schema';
import { IRefundRequestDocument, RefundRequestModel } from '@order/models/refund-request.schema';
import { publishDirectMessage } from '@order/queues/order.producer';
import { orderChannel } from '@order/server';

interface IRefundRequestPayload {
  reason: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

type PaidOrderDocument = IOrderDocument & {
  _id?: unknown;
  paymentAmountVnd?: number;
  paymentStatus?: string;
};

export const createRefundRequest = async (
  orderId: string,
  requesterUsername: string,
  data: IRefundRequestPayload
): Promise<IRefundRequestDocument> => {
  const order: PaidOrderDocument = (await OrderModel.findOne({ orderId }).exec()) as unknown as PaidOrderDocument;

  if (!order) {
    throw new BadRequestError('Order not found.', 'createRefundRequest()');
  }

  if (!requesterUsername || order.buyerUsername !== requesterUsername) {
    throw new BadRequestError('Only the buyer can request a refund for this order.', 'createRefundRequest()');
  }

  if (order.approved || order.paymentStatus !== 'HELD' || !order.paymentAmountVnd) {
    throw new BadRequestError('Refund is only available for paid orders still held by the platform.', 'createRefundRequest()');
  }

  const existingRefund = await RefundRequestModel.findOne({ orderId }).exec();
  if (existingRefund) {
    throw new BadRequestError('Refund request already exists for this order.', 'createRefundRequest()');
  }

  const refundRequest: IRefundRequestDocument = await RefundRequestModel.create({
    orderId: order.orderId,
    orderMongoId: `${order._id || ''}`,
    buyerId: order.buyerId,
    buyerUsername: order.buyerUsername,
    buyerEmail: order.buyerEmail,
    paidAmountVnd: order.paymentAmountVnd,
    reason: data.reason,
    bankInfo: data.bankInfo,
    status: 'PENDING'
  });

  await OrderModel.updateOne({ orderId }, { $set: { paymentStatus: 'REFUND_REQUESTED' } }).exec();

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
        bankName: data.bankInfo.bankName,
        accountNumber: data.bankInfo.accountNumber,
        accountName: data.bankInfo.accountName,
        refundRequestId: `${refundRequest._id}`,
        orderUrl: `${config.CLIENT_URL}/orders/${order.orderId}/activities`
      }),
      'Refund request email sent to notification service.'
    );
  }

  return refundRequest;
};
