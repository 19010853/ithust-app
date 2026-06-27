import Stripe from 'stripe';
import { WithdrawalModel } from '@users/models/withdrawal.schema';
import { SellerModel } from '@users/models/seller.schema';
import { BadRequestError } from '@19010853/ithust-shared';
import { createConnection } from '@users/queues/connection';
import { publishDirectMessage } from '@users/queues/user.producer';
import { Channel } from 'amqplib';
import { config } from '@users/config';
import {
  checkAndEnsurePlatformBalance,
  configureManualPayoutSchedule,
  createConnectedAccountPayout,
  createTransfer
} from '@users/services/stripe-connect.service';
import {
  refreshStripeAccountStatus,
  refreshStripeAccountStatusByAccountId,
  refreshStripeAccountStatusFromEventAccount
} from '@users/services/stripe-seller.service';

interface IWithdrawalStatusUpdate {
  status: 'COMPLETED' | 'REJECTED' | 'FAILED' | 'MANUAL_REVIEW' | 'RECONCILIATION_REQUIRED';
  adminNote?: string;
  paymentReference?: string;
  processedBy?: {
    id?: number;
    username?: string;
    email?: string;
  };
}

interface IWithdrawalFilters {
  bankName?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: string;
  maxAmount?: string;
  minAmount?: string;
  page?: string;
  processedFrom?: string;
  processedTo?: string;
  q?: string;
  sellerEmail?: string;
  sellerUsername?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}

type SellerStripeDocument = {
  _id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  availableBalance?: number;
  stripeAccountId?: string;
  stripePayoutReadiness?: string;
  stripeExternalAccountReady?: boolean;
  stripeRequirementsCurrentlyDue?: string[];
  stripeRequirementsPastDue?: string[];
  stripeRequirementsDisabledReason?: string;
  payoutsEnabled?: boolean;
  stripeDetailsSubmitted?: boolean;
};

const parsePositiveInt = (value: string | undefined, fallback: number, max = 100): number => {
  const parsed = parseInt(`${value || ''}`, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, max);
};

const parseOptionalNumber = (value: string | undefined): number | undefined => {
  if (!value?.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const escapedRegex = (value: string): RegExp => new RegExp(value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

const appendDateRange = (query: Record<string, unknown>, field: string, from?: string, to?: string): void => {
  const range: Record<string, Date> = {};
  if (from && !Number.isNaN(Date.parse(from))) {
    range.$gte = new Date(from);
  }
  if (to && !Number.isNaN(Date.parse(to))) {
    range.$lte = new Date(to);
  }
  if (Object.keys(range).length) {
    query[field] = range;
  }
};

const stripeReadinessMessage = (seller: SellerStripeDocument): string => {
  if (!seller.stripeAccountId) {
    return 'Seller must create a Stripe connected account before requesting a withdrawal.';
  }
  if (!seller.stripeDetailsSubmitted) {
    return 'Seller must complete Stripe onboarding/KYC before requesting a withdrawal.';
  }
  if (!seller.stripeExternalAccountReady) {
    return 'Seller must add a bank account or debit card in Stripe before requesting a withdrawal.';
  }
  if (!seller.payoutsEnabled) {
    return 'Stripe has not enabled payouts for this seller yet.';
  }
  if (seller.stripeRequirementsDisabledReason) {
    return `Stripe account is restricted: ${seller.stripeRequirementsDisabledReason}.`;
  }
  const due = [...(seller.stripeRequirementsCurrentlyDue || []), ...(seller.stripeRequirementsPastDue || [])];
  if (due.length) {
    return `Seller must complete Stripe requirements: ${due.join(', ')}.`;
  }
  return 'Seller is not eligible for Stripe payouts yet.';
};

const getPayoutWithdrawalSelector = (payout: Stripe.Payout): Record<string, unknown> => {
  const withdrawalId = `${payout.metadata?.withdrawalId || ''}`;
  const conditions: Record<string, unknown>[] = [{ providerPayoutId: payout.id }];
  if (withdrawalId) {
    conditions.push({ _id: withdrawalId });
  }
  return { $or: conditions };
};

const publishWithdrawalStatusEmail = async (withdrawal: any): Promise<void> => {
  const seller = await SellerModel.findById(withdrawal.sellerId).exec();
  const channel: Channel | undefined = await createConnection();
  if (channel && seller) {
    await publishDirectMessage(
      channel,
      'ithust-withdrawal-notification',
      'withdrawal-email',
      JSON.stringify({
        receiverEmail: seller.email,
        template: 'withdrawalStatus',
        sellerUsername: seller.username,
        sellerFullName: seller.fullName,
        amount: withdrawal.amount,
        bankName: withdrawal.bankInfo?.bankName || '',
        accountNumber: withdrawal.bankInfo?.accountNumber || '',
        accountName: withdrawal.bankInfo?.accountName || '',
        withdrawalId: `${withdrawal._id}`,
        status: withdrawal.status,
        processedDate: withdrawal.processedDate,
        adminNote: withdrawal.adminNote,
        paymentReference: withdrawal.paymentReference || withdrawal.providerPayoutId
      }),
      'Withdrawal status email sent to notification service.'
    );
  }
};

const createWithdrawal = async (sellerId: string, amount: number): Promise<any> => {
  if (!config.STRIPE_AUTOMATIC_PAYOUT_ENABLED) {
    throw new BadRequestError('Stripe automatic payout is disabled.', 'createWithdrawal()');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestError('Invalid withdrawal amount', 'createWithdrawal()');
  }

  if (amount < config.PAYOUT_MIN_AMOUNT || amount > config.PAYOUT_MAX_AMOUNT_PER_REQUEST) {
    throw new BadRequestError('Withdrawal amount is outside configured payout limits.', 'createWithdrawal()');
  }

  const refreshedSeller = (await refreshStripeAccountStatus(sellerId)) as SellerStripeDocument | null;
  if (!refreshedSeller) {
    throw new BadRequestError('Seller not found', 'createWithdrawal()');
  }

  if (refreshedSeller.stripePayoutReadiness !== 'READY') {
    throw new BadRequestError(stripeReadinessMessage(refreshedSeller), 'createWithdrawal()');
  }

  if (Number(refreshedSeller.availableBalance || 0) < amount) {
    throw new BadRequestError('Insufficient available balance', 'createWithdrawal()');
  }

  const balanceUpdate = await SellerModel.updateOne(
    { _id: sellerId, availableBalance: { $gte: amount } },
    {
      $inc: { availableBalance: -amount, pendingWithdrawals: amount }
    }
  ).exec();
  if (!balanceUpdate.modifiedCount) {
    throw new BadRequestError('Insufficient available balance', 'createWithdrawal()');
  }

  const stripeAccountId = `${refreshedSeller.stripeAccountId}`;
  const withdrawal = await WithdrawalModel.create({
    sellerId,
    amount,
    bankInfo: {},
    status: 'PROCESSING',
    provider: 'STRIPE_CONNECT',
    stripeAccountId
  });

  let transferCreated = false;
  try {
    await configureManualPayoutSchedule(stripeAccountId);
    await checkAndEnsurePlatformBalance(amount);
    const transfer = await createTransfer(`${withdrawal._id}`, amount, stripeAccountId);
    transferCreated = true;
    await WithdrawalModel.updateOne(
      { _id: withdrawal._id },
      {
        $set: {
          providerTransferId: transfer.transferId,
          providerAmount: transfer.amount,
          providerCurrency: transfer.currency
        }
      }
    ).exec();

    const payout = await createConnectedAccountPayout(`${withdrawal._id}`, amount, stripeAccountId);
    await WithdrawalModel.updateOne(
      { _id: withdrawal._id },
      {
        $set: {
          status: 'COMPLETED',
          processedDate: new Date(),
          providerPayoutId: payout.payoutId,
          payoutStatus: payout.status,
          providerAmount: payout.amount,
          providerCurrency: payout.currency,
          paymentReference: payout.payoutId
        }
      }
    ).exec();

    const completedWithdrawal = await WithdrawalModel.findById(withdrawal._id).exec();
    void publishWithdrawalStatusEmail(completedWithdrawal).catch(() => undefined);
    return completedWithdrawal;
  } catch (error) {
    const failureMessage = error instanceof Error ? error.message : 'Stripe payout failed.';
    await WithdrawalModel.updateOne(
      { _id: withdrawal._id },
      {
        $set: {
          status: transferCreated ? 'RECONCILIATION_REQUIRED' : 'FAILED',
          reconciliationStatus: transferCreated ? 'REQUIRED' : 'NONE',
          failureReason: failureMessage,
          providerFailureMessage: failureMessage,
          processedDate: new Date()
        }
      }
    ).exec();
    await SellerModel.updateOne(
      { _id: sellerId },
      transferCreated ? { $inc: { pendingWithdrawals: -amount } } : { $inc: { availableBalance: amount, pendingWithdrawals: -amount } }
    ).exec();
    throw new BadRequestError(failureMessage, 'createWithdrawal()');
  }
};

const getWithdrawals = async (filters: IWithdrawalFilters = {}): Promise<any> => {
  const page = parsePositiveInt(filters.page, 1);
  const limit = parsePositiveInt(filters.limit, 20);
  const skip = (page - 1) * limit;
  const query: Record<string, unknown> = {};

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.bankName?.trim()) {
    query['bankInfo.bankName'] = escapedRegex(filters.bankName);
  }

  const amountRange: Record<string, number> = {};
  const minAmount = parseOptionalNumber(filters.minAmount);
  const maxAmount = parseOptionalNumber(filters.maxAmount);
  if (minAmount !== undefined) {
    amountRange.$gte = minAmount;
  }
  if (maxAmount !== undefined) {
    amountRange.$lte = maxAmount;
  }
  if (Object.keys(amountRange).length) {
    query.amount = amountRange;
  }

  appendDateRange(query, 'createdAt', filters.createdFrom, filters.createdTo);
  appendDateRange(query, 'processedDate', filters.processedFrom, filters.processedTo);

  const sellerQuery: Record<string, unknown> = {};
  if (filters.sellerUsername?.trim()) {
    sellerQuery.username = escapedRegex(filters.sellerUsername);
  }
  if (filters.sellerEmail?.trim()) {
    sellerQuery.email = escapedRegex(filters.sellerEmail);
  }

  if (Object.keys(sellerQuery).length) {
    const sellers = await SellerModel.find(sellerQuery).select('_id').lean().exec();
    query.sellerId = { $in: sellers.map((seller) => seller._id) };
  }

  if (filters.q?.trim()) {
    const regex = escapedRegex(filters.q);
    const matchingSellers = await SellerModel.find({
      $or: [{ username: regex }, { fullName: regex }, { email: regex }]
    })
      .select('_id')
      .lean()
      .exec();

    const searchConditions: Record<string, unknown>[] = [
      { 'bankInfo.bankName': regex },
      { 'bankInfo.accountNumber': regex },
      { 'bankInfo.accountName': regex },
      { providerTransferId: regex },
      { providerPayoutId: regex },
      { paymentReference: regex }
    ];
    if (matchingSellers.length) {
      searchConditions.push({ sellerId: { $in: matchingSellers.map((seller) => seller._id) } });
    }
    query.$or = searchConditions;
  }

  const allowedSort = new Set(['createdAt', 'processedDate', 'amount', 'status']);
  const sortBy = allowedSort.has(`${filters.sortBy}`) ? `${filters.sortBy}` : 'createdAt';
  const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
  const [withdrawals, total] = await Promise.all([
    WithdrawalModel.find(query)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit)
      .populate('sellerId', 'username fullName email')
      .exec(),
    WithdrawalModel.countDocuments(query).exec()
  ]);

  return {
    withdrawals,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1)
    },
    filters
  };
};

const updateWithdrawalStatus = async (withdrawalId: string, data: IWithdrawalStatusUpdate): Promise<any> => {
  const withdrawal = await WithdrawalModel.findOneAndUpdate(
    { _id: withdrawalId, status: { $in: ['PENDING', 'MANUAL_REVIEW', 'FAILED', 'RECONCILIATION_REQUIRED'] } },
    {
      $set: {
        status: data.status,
        processedDate: new Date(),
        processedBy: {
          id: data.processedBy?.id,
          username: data.processedBy?.username || '',
          email: data.processedBy?.email || ''
        },
        adminNote: data.adminNote?.trim() || '',
        paymentReference: data.paymentReference?.trim() || ''
      }
    },
    { new: false }
  ).exec();

  if (!withdrawal) {
    throw new BadRequestError('Withdrawal is not pending or does not exist', 'updateWithdrawalStatus()');
  }

  const isStripeWithdrawal = withdrawal.provider === 'STRIPE_CONNECT';
  if (!isStripeWithdrawal) {
    const sellerUpdate =
      data.status === 'REJECTED' || data.status === 'FAILED'
        ? { $inc: { pendingWithdrawals: -withdrawal.amount, availableBalance: withdrawal.amount } }
        : data.status === 'COMPLETED'
          ? { $inc: { pendingWithdrawals: -withdrawal.amount } }
          : {};

    if (Object.keys(sellerUpdate).length) {
      await SellerModel.updateOne({ _id: withdrawal.sellerId }, sellerUpdate).exec();
    }
  }

  const updatedWithdrawal = await WithdrawalModel.findById(withdrawalId).exec();
  if (updatedWithdrawal) {
    await publishWithdrawalStatusEmail(updatedWithdrawal);
  }

  return updatedWithdrawal;
};

const updateWithdrawalPayoutStatus = async (payout: Stripe.Payout): Promise<void> => {
  await WithdrawalModel.updateOne(getPayoutWithdrawalSelector(payout), {
    $set: {
      providerPayoutId: payout.id,
      payoutStatus: payout.status,
      paymentReference: payout.id
    }
  }).exec();
};

const completeWithdrawalFromPayout = async (payout: Stripe.Payout): Promise<void> => {
  const withdrawal = await WithdrawalModel.findOneAndUpdate(
    { ...getPayoutWithdrawalSelector(payout), status: 'PROCESSING' },
    {
      $set: {
        status: 'COMPLETED',
        payoutStatus: payout.status,
        providerPayoutId: payout.id,
        paymentReference: payout.id,
        processedDate: new Date(),
        failureReason: '',
        providerFailureCode: '',
        providerFailureMessage: ''
      }
    },
    { new: true }
  ).exec();

  if (withdrawal) {
    await SellerModel.updateOne({ _id: withdrawal.sellerId }, { $inc: { pendingWithdrawals: -withdrawal.amount } }).exec();
    await publishWithdrawalStatusEmail(withdrawal);
  }
};

const failWithdrawalFromPayout = async (payout: Stripe.Payout): Promise<void> => {
  const payoutWithFailure = payout as Stripe.Payout & { failure_code?: string | null; failure_message?: string | null };
  const failureCode = `${payoutWithFailure.failure_code || ''}`;
  const failureMessage = `${payoutWithFailure.failure_message || 'Stripe payout failed. Manual reconciliation is required.'}`;
  const withdrawal = await WithdrawalModel.findOneAndUpdate(
    { ...getPayoutWithdrawalSelector(payout), status: 'PROCESSING' },
    {
      $set: {
        status: 'RECONCILIATION_REQUIRED',
        reconciliationStatus: 'REQUIRED',
        payoutStatus: payout.status,
        providerPayoutId: payout.id,
        paymentReference: payout.id,
        failureReason: failureMessage,
        providerFailureCode: failureCode,
        providerFailureMessage: failureMessage,
        processedDate: new Date()
      }
    },
    { new: true }
  ).exec();

  if (withdrawal) {
    await SellerModel.updateOne({ _id: withdrawal.sellerId }, { $inc: { pendingWithdrawals: -withdrawal.amount } }).exec();
    await publishWithdrawalStatusEmail(withdrawal);
  }
};

const handleStripeConnectWebhookEvent = async (event: Stripe.Event): Promise<void> => {
  if (event.type === 'account.updated') {
    await refreshStripeAccountStatusFromEventAccount(event.data.object as Stripe.Account);
    return;
  }

  if (['account.external_account.created', 'account.external_account.updated', 'account.external_account.deleted'].includes(event.type)) {
    const externalAccount = event.data.object as { account?: string };
    if (externalAccount.account) {
      await refreshStripeAccountStatusByAccountId(externalAccount.account);
    }
    return;
  }

  if (!['payout.created', 'payout.updated', 'payout.paid', 'payout.failed'].includes(event.type)) {
    return;
  }

  const payout = event.data.object as Stripe.Payout;
  if (event.type === 'payout.paid') {
    await completeWithdrawalFromPayout(payout);
    return;
  }

  if (event.type === 'payout.failed') {
    await failWithdrawalFromPayout(payout);
    return;
  }

  await updateWithdrawalPayoutStatus(payout);
};

export { createWithdrawal, getWithdrawals, handleStripeConnectWebhookEvent, updateWithdrawalStatus, IWithdrawalFilters };
