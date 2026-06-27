import Stripe from 'stripe';
import { config } from '@users/config';
import { getVndPerUnit, isZeroDecimalCurrency } from '@users/services/exchange-rate.service';

export interface IStripePayoutReadiness {
  ready: boolean;
  onboardingStatus: 'NOT_STARTED' | 'PENDING' | 'COMPLETED';
  payoutReadiness: 'NOT_STARTED' | 'RESTRICTED' | 'READY';
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
  externalAccountReady: boolean;
  currentlyDue: string[];
  pastDue: string[];
  disabledReason: string;
}

let stripeClient: Stripe | undefined;

export const stripe = (): Stripe => {
  if (!config.STRIPE_SECRET_KEY) {
    throw new Error('Stripe secret key is not configured.');
  }
  if (!stripeClient) {
    stripeClient = new Stripe(config.STRIPE_SECRET_KEY);
  }
  return stripeClient;
};

const appendSellerId = (url: string, sellerId: string): string => {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}sellerId=${encodeURIComponent(sellerId)}`;
};

export const toStripeAmountFromVnd = async (amountVnd: number): Promise<{ amountInSmallestUnit: number; value: string; currency: string }> => {
  const currency = config.STRIPE_CURRENCY;
  const { vndPerUnit } = await getVndPerUnit();
  const valueInCurrency = amountVnd / vndPerUnit;
  const zeroDecimal = isZeroDecimalCurrency(currency);
  const amountInSmallestUnit = zeroDecimal
    ? Math.max(Math.round(valueInCurrency), 1)
    : Math.max(Math.round(valueInCurrency * 100), 50);
  const value = zeroDecimal ? `${amountInSmallestUnit}` : (amountInSmallestUnit / 100).toFixed(2);
  return { amountInSmallestUnit, value, currency };
};

export const createExpressAccount = async (email: string): Promise<Stripe.Account> =>
  stripe().accounts.create({
    type: 'express',
    email,
    capabilities: {
      transfers: { requested: true }
    }
  });

export const createAccountLink = async (accountId: string, sellerId: string): Promise<Stripe.AccountLink> =>
  stripe().accountLinks.create({
    account: accountId,
    refresh_url: appendSellerId(config.STRIPE_CONNECT_REFRESH_URL, sellerId),
    return_url: appendSellerId(config.STRIPE_CONNECT_RETURN_URL, sellerId),
    type: 'account_onboarding',
    collection_options: {
      fields: 'eventually_due',
      future_requirements: 'include'
    }
  });

export const retrieveAccount = async (accountId: string): Promise<Stripe.Account> =>
  stripe().accounts.retrieve(accountId, { expand: ['external_accounts'] });

export const evaluateStripePayoutReadiness = (account?: Stripe.Account | null): IStripePayoutReadiness => {
  if (!account) {
    return {
      ready: false,
      onboardingStatus: 'NOT_STARTED',
      payoutReadiness: 'NOT_STARTED',
      payoutsEnabled: false,
      chargesEnabled: false,
      detailsSubmitted: false,
      externalAccountReady: false,
      currentlyDue: [],
      pastDue: [],
      disabledReason: ''
    };
  }

  const currentlyDue = account.requirements?.currently_due || [];
  const pastDue = account.requirements?.past_due || [];
  const disabledReason = `${account.requirements?.disabled_reason || ''}`;
  const externalAccountReady = Boolean(account.external_accounts?.data?.length);
  const ready =
    Boolean(account.details_submitted) &&
    Boolean(account.payouts_enabled) &&
    externalAccountReady &&
    currentlyDue.length === 0 &&
    pastDue.length === 0 &&
    !disabledReason;

  return {
    ready,
    onboardingStatus: ready ? 'COMPLETED' : 'PENDING',
    payoutReadiness: ready ? 'READY' : 'RESTRICTED',
    payoutsEnabled: account.payouts_enabled,
    chargesEnabled: account.charges_enabled,
    detailsSubmitted: account.details_submitted,
    externalAccountReady,
    currentlyDue,
    pastDue,
    disabledReason
  };
};

export const configureManualPayoutSchedule = async (accountId: string): Promise<void> => {
  await stripe().accounts.update(accountId, {
    settings: {
      payouts: {
        schedule: {
          interval: 'manual'
        }
      }
    }
  });
};

export const createTransfer = async (
  withdrawalId: string,
  amountVnd: number,
  destinationAccountId: string
): Promise<{ transferId: string; amount: string; currency: string }> => {
  const amount = await toStripeAmountFromVnd(amountVnd);
  const transfer = await stripe().transfers.create(
    {
      amount: amount.amountInSmallestUnit,
      currency: amount.currency,
      destination: destinationAccountId,
      metadata: { withdrawalId, amountVnd: `${amountVnd}` }
    },
    { idempotencyKey: `withdrawal-transfer-${withdrawalId}` }
  );
  return { transferId: transfer.id, amount: amount.value, currency: amount.currency };
};

export const createConnectedAccountPayout = async (
  withdrawalId: string,
  amountVnd: number,
  connectedAccountId: string
): Promise<{ payoutId: string; status: string; amount: string; currency: string }> => {
  const amount = await toStripeAmountFromVnd(amountVnd);
  const payout = await stripe().payouts.create(
    {
      amount: amount.amountInSmallestUnit,
      currency: amount.currency,
      description: `ITHust withdrawal ${withdrawalId}`,
      metadata: { withdrawalId, amountVnd: `${amountVnd}` }
    },
    {
      stripeAccount: connectedAccountId,
      idempotencyKey: `withdrawal-payout-${withdrawalId}`
    }
  );

  return { payoutId: payout.id, status: payout.status, amount: amount.value, currency: amount.currency };
};

const isStripeTestMode = (): boolean => config.STRIPE_SECRET_KEY.startsWith('sk_test_');

// In test mode, funds the platform balance by creating a charge with tok_bypassPending
// (Charges API bypasses the 2-day pending period immediately). We charge 110% to cover
// Stripe fees so the net available amount is sufficient for the transfer.
// STRIPE_CURRENCY must match the platform account's settlement currency (e.g. sgd for SG accounts).
export const checkAndEnsurePlatformBalance = async (amountVnd: number): Promise<void> => {
  if (isStripeTestMode()) {
    const amount = await toStripeAmountFromVnd(amountVnd);
    await stripe().charges.create({
      amount: Math.ceil(amount.amountInSmallestUnit * 1.1),
      currency: amount.currency,
      source: 'tok_bypassPending',
      description: `ITHust test platform funding for withdrawal`
    });
    return;
  }

  const amount = await toStripeAmountFromVnd(amountVnd);
  const balance = await stripe().balance.retrieve();
  const available = balance.available.find((b) => b.currency === amount.currency);
  if ((available?.amount ?? 0) < amount.amountInSmallestUnit) {
    throw new Error('Tài khoản Stripe platform chưa đủ số dư khả dụng để xử lý rút tiền.');
  }
};

export const constructConnectWebhookEvent = (payload: Buffer | string, signature: string): Stripe.Event => {
  if (!config.STRIPE_CONNECT_WEBHOOK_SECRET) {
    throw new Error('Stripe Connect webhook secret is not configured.');
  }
  return stripe().webhooks.constructEvent(payload, signature, config.STRIPE_CONNECT_WEBHOOK_SECRET);
};
