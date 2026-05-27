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

const getWithdrawals = async (status?: string): Promise<any[]> => {
  const query = status ? { status } : {};
  const withdrawals = await WithdrawalModel.find(query).sort({ createdAt: -1 }).populate('sellerId', 'username fullName email').exec();
  return withdrawals;
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

export { createWithdrawal, getWithdrawals, updateWithdrawalStatus };
