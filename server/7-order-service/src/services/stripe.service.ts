import Stripe from 'stripe';
import { BadRequestError } from '@19010853/ithust-shared';
import { config } from '@order/config';
import { toStripeAmountFromVnd } from '@order/services/exchange-rate.service';

let stripeClient: Stripe | undefined;

const stripe = (): Stripe => {
  if (!config.STRIPE_SECRET_KEY) {
    throw new BadRequestError('Stripe secret key is not configured.', 'Stripe provider');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

export const createStripePaymentIntent = async (
  mongoOrderId: string,
  orderId: string,
  amountVnd: number,
  idempotencyKey: string
): Promise<{
  providerPaymentId: string;
  clientSecret: string;
  amount: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource: string;
  exchangeRateFetchedAt: Date;
}> => {
  const amount = await toStripeAmountFromVnd(amountVnd);
  const intent = await stripe().paymentIntents.create(
    {
      amount: amount.amountInSmallestUnit,
      currency: amount.currency,
      automatic_payment_methods: { enabled: true },
      metadata: {
        orderMongoId: mongoOrderId,
        orderId,
        amountVnd: `${amountVnd}`
      }
    },
    { idempotencyKey }
  );
  if (!intent.client_secret) {
    throw new Error('Stripe did not return a client secret.');
  }
  return {
    providerPaymentId: intent.id,
    clientSecret: intent.client_secret,
    amount: amount.value,
    currency: amount.currency,
    exchangeRate: amount.exchangeRate,
    exchangeRateSource: amount.exchangeRateSource,
    exchangeRateFetchedAt: amount.exchangeRateFetchedAt
  };
};

export const constructStripeEvent = (rawBody: Buffer, signature: string | string[] | undefined): Stripe.Event => {
  if (!config.STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured.');
  }
  const header = Array.isArray(signature) ? signature[0] : signature;
  if (!header) {
    throw new Error('Missing Stripe signature.');
  }
  return stripe().webhooks.constructEvent(rawBody, header, config.STRIPE_WEBHOOK_SECRET);
};

export const refundStripePaymentIntent = async (
  paymentIntentId: string,
  idempotencyKey: string
): Promise<{ id: string; status: string | null }> => {
  const refund = await stripe().refunds.create({ payment_intent: paymentIntentId }, { idempotencyKey });
  return { id: refund.id, status: refund.status };
};

export type { Stripe };
