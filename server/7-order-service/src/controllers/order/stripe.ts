import { createHash } from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { OrderModel } from '@order/models/order.schema';
import { PaymentEventModel } from '@order/models/payment-event.schema';
import { completeStripeRefundForPaymentIntent } from '@order/services/refund.service';
import { activatePaidOrder } from '@order/services/order.service';
import { constructStripeEvent, Stripe } from '@order/services/stripe.service';

type RawBodyRequest = Request & { rawBody?: Buffer };

const payloadHash = (body: Buffer): string => createHash('sha256').update(body).digest('hex');

export const stripeWebhook = async (req: RawBodyRequest, res: Response): Promise<void> => {
  if (!req.rawBody) {
    res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'Missing raw Stripe webhook body.' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = constructStripeEvent(req.rawBody, req.headers['stripe-signature']);
  } catch (error) {
    res.status(StatusCodes.UNAUTHORIZED).json({ success: false, message: 'Invalid Stripe webhook signature.' });
    return;
  }

  const existing = await PaymentEventModel.findOne({ provider: 'stripe', providerEventId: event.id }).exec();
  if (existing) {
    res.status(StatusCodes.OK).json({ success: true, duplicate: true });
    return;
  }

  let orderId = '';
  let providerPaymentId = '';
  let providerChargeId = '';
  let amount: number | undefined;
  let currency = '';
  let processingResult: 'RECEIVED' | 'PROCESSED' | 'IGNORED' | 'RECONCILIATION_REQUIRED' = 'IGNORED';
  let processingMessage = '';

  if (event.type === 'payment_intent.succeeded') {
    const intent = event.data.object as Stripe.PaymentIntent;
    providerPaymentId = intent.id;
    providerChargeId = `${intent.latest_charge || ''}`;
    amount = intent.amount_received;
    currency = intent.currency;

    const order = await OrderModel.findOne({ providerPaymentId: intent.id, paymentProvider: 'stripe' }).exec() as any;
    orderId = `${order?.orderId || intent.metadata?.orderId || ''}`;
    const providerAmount = (intent.amount_received / 100).toFixed(2);
    if (order && order.providerAmount === providerAmount && order.providerCurrency === intent.currency) {
      const activation = await activatePaidOrder(`${order._id}`, 'stripe', providerChargeId, event.id);
      processingResult = activation.activated || (activation.order as any)?.paymentStatus === 'HELD' ? 'PROCESSED' : 'RECONCILIATION_REQUIRED';
    } else {
      processingResult = 'RECONCILIATION_REQUIRED';
      processingMessage = 'Stripe amount/currency/order did not match a pending ITHust order.';
    }
  } else if (event.type === 'charge.refunded') {
    const charge = event.data.object as Stripe.Charge;
    providerPaymentId = `${charge.payment_intent || ''}`;
    providerChargeId = charge.id;
    amount = charge.amount_refunded;
    currency = charge.currency;
    const { order, completed } = await completeStripeRefundForPaymentIntent(providerPaymentId);
    orderId = `${order?.orderId || ''}`;
    processingResult = order ? 'PROCESSED' : 'IGNORED';
    processingMessage = completed ? '' : order ? 'Order was already refunded before this webhook.' : '';
  }

  await PaymentEventModel.create({
    provider: 'stripe',
    providerEventId: event.id,
    eventType: event.type,
    orderId,
    providerPaymentId,
    amount,
    currency,
    reference: providerChargeId,
    payloadHash: payloadHash(req.rawBody),
    processingResult,
    processingMessage
  });

  res.status(StatusCodes.OK).json({ success: true });
};
