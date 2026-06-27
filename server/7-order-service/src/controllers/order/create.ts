import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { orderSchema } from '@order/schemes/order';
import { BadRequestError, IOrderDocument } from '@19010853/ithust-shared';
import { createOrder } from '@order/services/order.service';
import { createStripePaymentIntent } from '@order/services/stripe.service';
import { OrderModel } from '@order/models/order.schema';

type StripeOrderData = IOrderDocument & {
  paymentAmountVnd: number;
  paymentCurrency: 'VND';
  paymentProvider: 'stripe';
  providerPaymentId?: string;
  providerAmount?: string;
  providerCurrency?: string;
};

const SERVICE_FEE_RATE = 0.055;
const SERVICE_FEE_THRESHOLD_VND = 1250000;
const SERVICE_FEE_FIXED_AMOUNT_VND = 50000;

const calculateServiceFeeVnd = (price: number): number =>
  Math.round(price * SERVICE_FEE_RATE + (price < SERVICE_FEE_THRESHOLD_VND ? SERVICE_FEE_FIXED_AMOUNT_VND : 0));

const order = async (req: Request, res: Response): Promise<void> => {
  const { error } = await Promise.resolve(orderSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Create order() method');
  }

  const serviceFee: number = calculateServiceFeeVnd(req.body.price);
  const paymentAmountVnd: number = req.body.price + serviceFee;
  const orderData: StripeOrderData = {
    ...req.body,
    serviceFee,
    status: 'PENDING_PAYMENT',
    paymentAmountVnd,
    paymentCurrency: 'VND',
    paymentProvider: 'stripe',
    paymentStatus: 'PENDING'
  };
  
  const newOrder: IOrderDocument = await createOrder(orderData);
  const stripe = await createStripePaymentIntent(
    `${(newOrder as IOrderDocument & { _id: string })._id}`,
    newOrder.orderId,
    paymentAmountVnd,
    req.body.checkoutAttemptId || newOrder.orderId
  );
  await OrderModel.updateOne(
    { _id: (newOrder as IOrderDocument & { _id: string })._id, paymentStatus: 'PENDING' },
    {
      $set: {
        providerPaymentId: stripe.providerPaymentId,
        providerAmount: stripe.amount,
        providerCurrency: stripe.currency
      }
    }
  ).exec();

  res.status(StatusCodes.CREATED).json({ 
    message: 'Order created. Confirm payment with Stripe Sandbox.', 
    order: newOrder,
    payment: {
      provider: 'stripe',
      mode: 'sandbox',
      clientSecret: stripe.clientSecret,
      providerPaymentId: stripe.providerPaymentId,
      amount: paymentAmountVnd,
      currency: 'VND',
      providerAmount: stripe.amount,
      providerCurrency: stripe.currency,
      exchangeRate: stripe.exchangeRate,
      exchangeRateSource: stripe.exchangeRateSource,
      exchangeRateFetchedAt: stripe.exchangeRateFetchedAt
    }
  });
};

export { order };
