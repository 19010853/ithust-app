import { WithdrawalModel } from '@users/models/withdrawal.schema';
import { SellerModel } from '@users/models/seller.schema';
import { BadRequestError } from '@19010853/ithust-shared';
import { createConnection } from '@users/queues/connection';
import { publishDirectMessage } from '@users/queues/user.producer';
import { Channel } from 'amqplib';
import { config } from '@users/config';

interface IBankAccount {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface IWithdrawalStatusUpdate {
  status: 'COMPLETED' | 'REJECTED';
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

const parsePositiveInt = (value: string | undefined, fallback: number, max = 100): number => {
  const parsed = parseInt(`${value || ''}`, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, max);
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

const createWithdrawal = async (
  sellerId: string,
  amount: number,
  bankAccount: IBankAccount
): Promise<any> => {
  const seller = await SellerModel.findById(sellerId).exec();
  if (!seller) {
    throw new BadRequestError('Seller not found', 'createWithdrawal()');
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new BadRequestError('Invalid withdrawal amount', 'createWithdrawal()');
  }

  if (!config.PLATFORM_OWNER_EMAIL) {
    throw new BadRequestError('Platform owner email is not configured', 'createWithdrawal()');
  }

  if (Number(seller.availableBalance || 0) < amount) {
    throw new BadRequestError('Insufficient available balance', 'createWithdrawal()');
  }

  const payoutBankAccount: IBankAccount = {
    bankName: bankAccount.bankName.trim(),
    accountNumber: bankAccount.accountNumber.trim(),
    accountName: bankAccount.accountName.trim()
  };

  const balanceUpdate = await SellerModel.updateOne(
    { _id: sellerId, availableBalance: { $gte: amount } },
    {
      $inc: { availableBalance: -amount, pendingWithdrawals: amount },
      $set: { bankAccount: payoutBankAccount }
    }
  ).exec();
  if (!balanceUpdate.modifiedCount) {
    throw new BadRequestError('Insufficient available balance', 'createWithdrawal()');
  }

  const withdrawal = await WithdrawalModel.create({
    sellerId,
    amount,
    bankInfo: payoutBankAccount,
    status: 'PENDING'
  });

  const channel: Channel | undefined = await createConnection();
  if (channel) {
    await publishDirectMessage(
      channel,
      'ithust-withdrawal-notification',
      'withdrawal-email',
      JSON.stringify({
        receiverEmail: config.PLATFORM_OWNER_EMAIL,
        template: 'withdrawalRequest',
        sellerUsername: seller.username,
        sellerFullName: seller.fullName,
        amount,
        bankName: withdrawal.bankInfo.bankName,
        accountNumber: withdrawal.bankInfo.accountNumber,
        accountName: withdrawal.bankInfo.accountName,
        withdrawalId: `${withdrawal._id}`,
        requestDate: withdrawal.createdAt
      }),
      'Withdrawal request email sent to notification service.'
    );
  }

  return withdrawal;
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
  const minAmount = Number(filters.minAmount);
  const maxAmount = Number(filters.maxAmount);
  if (Number.isFinite(minAmount)) {
    amountRange.$gte = minAmount;
  }
  if (Number.isFinite(maxAmount)) {
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
      { 'bankInfo.accountName': regex }
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
    { _id: withdrawalId, status: 'PENDING' },
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
    { new: true }
  ).exec();

  if (!withdrawal) {
    throw new BadRequestError('Withdrawal is not pending or does not exist', 'updateWithdrawalStatus()');
  }

  const sellerUpdate =
    data.status === 'REJECTED'
      ? { $inc: { pendingWithdrawals: -withdrawal.amount, availableBalance: withdrawal.amount } }
      : { $inc: { pendingWithdrawals: -withdrawal.amount } };

  await SellerModel.updateOne({ _id: withdrawal.sellerId }, sellerUpdate).exec();

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
        bankName: withdrawal.bankInfo.bankName,
        accountNumber: withdrawal.bankInfo.accountNumber,
        accountName: withdrawal.bankInfo.accountName,
        withdrawalId: `${withdrawal._id}`,
        status: withdrawal.status,
        processedDate: withdrawal.processedDate,
        adminNote: withdrawal.adminNote,
        paymentReference: withdrawal.paymentReference
      }),
      'Withdrawal status email sent to notification service.'
    );
  }

  return withdrawal;
};

export { createWithdrawal, getWithdrawals, updateWithdrawalStatus, IWithdrawalFilters };
