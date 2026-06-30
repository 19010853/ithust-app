import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';
import { config } from '@order/config';
import { DisputeMessageModel, IDisputeMessageDocument } from '@order/models/dispute-message.schema';
import { DisputeModel, IDisputeDocument } from '@order/models/dispute.schema';
import { OrderModel } from '@order/models/order.schema';
import { RefundRequestModel } from '@order/models/refund-request.schema';
import { creditApprovedRefund } from '@order/services/refund.service';
import { approveOrder } from '@order/services/order.service';
import { publishDirectMessage } from '@order/queues/order.producer';
import { orderChannel } from '@order/server';
import { emitOrderUpdate, sendNotification } from '@order/services/notification.service';

type Actor = { id?: number; username: string; email?: string; role?: string };

const notifyDispute = async (
  dispute: IDisputeDocument,
  recipients: Array<{ email?: string; username?: string }>,
  actorUsername: string,
  reason: string,
  decision = ''
): Promise<void> => {
  for (const recipient of recipients.filter((item, index, all) => item.email && all.findIndex((other) => other.email === item.email) === index)) {
    try {
      await publishDirectMessage(
        orderChannel,
        'ithust-order-notification',
        'order-email',
        JSON.stringify({
          receiverEmail: recipient.email,
          template: 'disputeStatus',
          recipientUsername: recipient.username,
          actorUsername,
          disputeId: `${dispute._id || ''}`,
          orderId: dispute.orderId,
          reason,
          decision,
          orderUrl: `${config.CLIENT_URL}/orders/${dispute.orderId}/activities`
        }),
        'Dispute status email sent to notification service.'
      );
    } catch {
      // Dispute state is authoritative; email delivery is best-effort.
    }
  }
};

const getDisputeAndAssertParticipant = async (disputeId: string, actor: Actor): Promise<IDisputeDocument> => {
  const dispute = await DisputeModel.findById(disputeId).exec();
  if (!dispute) throw new BadRequestError('Dispute not found.', 'getDisputeAndAssertParticipant()');
  const allowed = actor.role === 'admin' || [dispute.buyerUsername, dispute.sellerUsername].includes(actor.username);
  if (!allowed) throw new BadRequestError('You are not a participant in this dispute.', 'getDisputeAndAssertParticipant()');
  return dispute;
};

export const createQualityDispute = async (
  orderId: string,
  buyerUsername: string,
  reason: string,
  evidence: Array<{ url: string; fileName?: string; fileType?: string }> = []
): Promise<IDisputeDocument> => {
  const order = await OrderModel.findOne({ orderId }).exec() as any;
  if (!order) throw new BadRequestError('Order not found.', 'createQualityDispute()');
  if (order.buyerUsername !== buyerUsername) throw new BadRequestError('Only the buyer can open a dispute.', 'createQualityDispute()');
  const existing = await DisputeModel.findOne({ orderId }).exec();
  if (existing) return existing;
  if (order.status !== 'Delivered' || order.paymentStatus !== 'HELD' || order.approved) {
    throw new BadRequestError('A quality dispute is only available for delivered orders still under review.', 'createQualityDispute()');
  }
  const reviewDeadlineAt = (order as unknown as { reviewDeadlineAt?: Date }).reviewDeadlineAt;
  if (reviewDeadlineAt && reviewDeadlineAt.getTime() < Date.now()) {
    throw new BadRequestError('The review window has expired.', 'createQualityDispute()');
  }
  const dispute = await DisputeModel.create({
    orderId,
    buyerUsername: order.buyerUsername,
    sellerUsername: order.sellerUsername,
    reason,
    evidence,
    status: 'SELLER_RESPONSE_REQUIRED',
    sellerResponseDeadlineAt: new Date(Date.now() + config.DISPUTE_SELLER_RESPONSE_HOURS * 60 * 60 * 1000)
  });
  const updatedOrder = await OrderModel.findOneAndUpdate(
    { orderId, status: 'Delivered', paymentStatus: 'HELD', approved: false },
    { $set: { status: 'DISPUTED' } },
    { new: true }
  ).exec();
  if (updatedOrder) {
    await emitOrderUpdate(updatedOrder as unknown as IOrderDocument);
  }
  await notifyDispute(
    dispute,
    [
      { email: order.sellerEmail, username: order.sellerUsername },
      { email: process.env.PLATFORM_OWNER_EMAIL, username: 'admin' }
    ],
    order.buyerUsername,
    reason
  );
  await sendNotification(order as unknown as IOrderDocument, order.sellerUsername, 'đã mở tranh chấp cho đơn hàng của bạn.');
  return dispute;
};

export const addDisputeMessage = async (
  disputeId: string,
  actor: Actor,
  body: string,
  visibility: 'PARTICIPANTS' | 'ADMIN_INTERNAL' = 'PARTICIPANTS',
  attachments: Array<{ url: string; fileName?: string; fileType?: string }> = []
): Promise<IDisputeMessageDocument> => {
  const dispute = await getDisputeAndAssertParticipant(disputeId, actor);
  if (visibility === 'ADMIN_INTERNAL' && actor.role !== 'admin') {
    throw new BadRequestError('Only admins can create internal notes.', 'addDisputeMessage()');
  }
  const senderRole: 'buyer' | 'seller' | 'admin' =
    actor.role === 'admin' ? 'admin' : actor.username === dispute.buyerUsername ? 'buyer' : 'seller';
  const message = await DisputeMessageModel.create({
    disputeId: `${dispute._id}`, orderId: dispute.orderId, senderUsername: actor.username,
    senderRole, visibility, body, attachments
  });
  if (visibility === 'PARTICIPANTS') {
    const order = await OrderModel.findOne({ orderId: dispute.orderId }).exec();
    if (order) {
      const recipients = senderRole === 'admin'
        ? [
            { email: order.buyerEmail, username: order.buyerUsername },
            { email: order.sellerEmail, username: order.sellerUsername }
          ]
        : [
            senderRole === 'buyer'
              ? { email: order.sellerEmail, username: order.sellerUsername }
              : { email: order.buyerEmail, username: order.buyerUsername },
            { email: process.env.PLATFORM_OWNER_EMAIL, username: 'admin' }
          ];
      await notifyDispute(dispute, recipients, actor.username, body);
    }
  }
  return message;
};

export const getDisputeMessages = async (disputeId: string, actor: Actor): Promise<IDisputeMessageDocument[]> => {
  await getDisputeAndAssertParticipant(disputeId, actor);
  const query: Record<string, unknown> = { disputeId };
  if (actor.role !== 'admin') query.visibility = 'PARTICIPANTS';
  return DisputeMessageModel.find(query).sort({ createdAt: 1 }).lean().exec() as unknown as IDisputeMessageDocument[];
};

export const listDisputes = async (actor: Actor, status?: string): Promise<IDisputeDocument[]> => {
  const query: Record<string, unknown> = {};
  if (status) query.status = status;
  if (actor.role !== 'admin') query.$or = [{ buyerUsername: actor.username }, { sellerUsername: actor.username }];
  return DisputeModel.find(query).sort({ createdAt: -1 }).lean().exec() as unknown as IDisputeDocument[];
};

export const decideDispute = async (
  disputeId: string,
  admin: Actor,
  decision: 'REVISION_REQUIRED' | 'REFUND_BUYER' | 'RELEASE_SELLER',
  reason: string,
  revisionDeadlineAt?: Date
): Promise<IDisputeDocument> => {
  if (admin.role !== 'admin') throw new BadRequestError('Admin access required.', 'decideDispute()');
  const dispute = await DisputeModel.findOne({ _id: disputeId, status: { $in: ['OPEN', 'SELLER_RESPONSE_REQUIRED', 'REVISION_REQUIRED'] } }).exec();
  if (!dispute) throw new BadRequestError('Dispute is already resolved or does not exist.', 'decideDispute()');
  const order = await OrderModel.findOne({ orderId: dispute.orderId }).exec() as any;
  if (!order || order.paymentStatus !== 'HELD') throw new BadRequestError('Order funds are no longer held.', 'decideDispute()');

  if (decision === 'REVISION_REQUIRED') {
    if (!revisionDeadlineAt || revisionDeadlineAt.getTime() <= Date.now()) {
      throw new BadRequestError('A future revision deadline is required.', 'decideDispute()');
    }
    const updatedOrder = await OrderModel.findOneAndUpdate(
      { orderId: order.orderId, status: 'DISPUTED', paymentStatus: 'HELD' },
      { $set: { status: 'REVISION_REQUIRED', dueAt: revisionDeadlineAt, delivered: false } },
      { new: true }
    ).exec();
    if (updatedOrder) await emitOrderUpdate(updatedOrder as unknown as IOrderDocument);
  } else if (decision === 'REFUND_BUYER') {
    let refund = await RefundRequestModel.findOne({ orderId: order.orderId }).exec();
    if (!refund) {
      refund = await RefundRequestModel.create({
        orderId: order.orderId, orderMongoId: `${order._id}`, buyerId: order.buyerId,
        buyerUsername: order.buyerUsername, buyerEmail: order.buyerEmail, paidAmountVnd: order.paymentAmountVnd,
        reason, bankInfo: {}, trigger: 'QUALITY_DISPUTE', decisionSource: 'ADMIN', settlementMode: config.REFUND_SETTLEMENT_MODE,
        status: 'PROCESSING'
      });
    }
    await creditApprovedRefund(order as unknown as IOrderDocument & { paymentAmountVnd: number }, refund, 'ADMIN', admin);
  } else {
    await approveOrder(order.orderId, {
      sellerId: order.sellerId, buyerId: order.buyerId, ongoingJobs: -1, completedJobs: 1,
      totalEarnings: order.price, purchasedGigs: order.gigId
    }, true);
  }

  const updatedDispute = (await DisputeModel.findByIdAndUpdate(
    disputeId,
    { $set: { status: decision, decisionReason: reason, revisionDeadlineAt, decidedBy: admin, decidedAt: new Date() } },
    { new: true }
  ).exec()) as unknown as IDisputeDocument;
  await notifyDispute(
    updatedDispute,
    [
      { email: order.buyerEmail, username: order.buyerUsername },
      { email: order.sellerEmail, username: order.sellerUsername }
    ],
    admin.username,
    reason,
    decision
  );
  const decisionMessage =
    decision === 'REFUND_BUYER'
      ? 'Admin đã quyết định hoàn tiền cho đơn hàng tranh chấp.'
      : decision === 'RELEASE_SELLER'
        ? 'Admin đã quyết định giải ngân cho seller sau tranh chấp.'
        : 'Admin yêu cầu chỉnh sửa lại đơn hàng sau tranh chấp.';
  await sendNotification(order as unknown as IOrderDocument, order.buyerUsername, decisionMessage);
  await sendNotification(order as unknown as IOrderDocument, order.sellerUsername, decisionMessage);
  return updatedDispute;
};
