import { config } from '@users/config';
import { BuyerModel } from '@users/models/buyer.schema';
import { WithdrawalModel } from '@users/models/withdrawal.schema';
import mongoose from 'mongoose';

const apply = process.argv.includes('--apply');

const run = async (): Promise<void> => {
  await mongoose.connect(`${config.DATABASE_URL}`);
  const buyerFilter = { $or: [{ refundAvailableBalance: { $exists: false } }, { refundPendingWithdrawals: { $exists: false } }] };
  const withdrawalFilter = { ownerType: { $exists: false } };
  const [buyerCount, withdrawalCount] = await Promise.all([
    BuyerModel.countDocuments(buyerFilter),
    WithdrawalModel.countDocuments(withdrawalFilter)
  ]);
  if (apply) {
    await Promise.all([
      BuyerModel.updateMany(buyerFilter, { $set: { refundAvailableBalance: 0, refundPendingWithdrawals: 0 } }).exec(),
      WithdrawalModel.updateMany(
        withdrawalFilter,
        { $set: { ownerType: 'SELLER_EARNINGS', provider: 'MANUAL_BANK', payoutMethod: { provider: 'MANUAL_BANK', paypalEmail: '' }, reconciliationStatus: 'NONE' } }
      ).exec()
    ]);
  }
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', buyers: buyerCount, legacyWithdrawals: withdrawalCount }, null, 2));
  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
