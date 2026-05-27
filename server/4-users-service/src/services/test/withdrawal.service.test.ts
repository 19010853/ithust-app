import { SellerModel } from '@users/models/seller.schema';
import { WithdrawalModel } from '@users/models/withdrawal.schema';
import { createConnection } from '@users/queues/connection';
import { publishDirectMessage } from '@users/queues/user.producer';
import { updateWithdrawalStatus } from '@users/services/withdrawal.service';

jest.mock('@users/models/withdrawal.schema', () => ({
  WithdrawalModel: {
    findOneAndUpdate: jest.fn()
  }
}));

jest.mock('@users/models/seller.schema', () => ({
  SellerModel: {
    updateOne: jest.fn(),
    findById: jest.fn()
  }
}));

jest.mock('@users/queues/connection', () => ({
  createConnection: jest.fn()
}));

jest.mock('@users/queues/user.producer', () => ({
  publishDirectMessage: jest.fn()
}));

describe('Withdrawal service', () => {
  const seller = {
    email: 'seller@test.com',
    username: 'seller',
    fullName: 'Seller Name'
  };

  beforeEach(() => {
    jest.resetAllMocks();
    (createConnection as jest.Mock).mockResolvedValue({});
    (publishDirectMessage as jest.Mock).mockResolvedValue(undefined);
    (SellerModel.findById as jest.Mock).mockReturnValue({
      exec: jest.fn().mockResolvedValue(seller)
    });
  });

  it('marks a pending withdrawal completed and releases pending withdrawals only', async () => {
    const withdrawal = {
      _id: 'withdrawal-id',
      sellerId: 'seller-id',
      amount: 50,
      status: 'COMPLETED',
      processedDate: new Date(),
      bankInfo: { bankName: 'VCB', accountNumber: '123456', accountName: 'SELLER' },
      adminNote: '',
      paymentReference: 'PAY-1'
    };
    (WithdrawalModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(withdrawal) });
    (SellerModel.updateOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });

    const result = await updateWithdrawalStatus('withdrawal-id', {
      status: 'COMPLETED',
      paymentReference: 'PAY-1'
    });

    expect(result).toEqual(withdrawal);
    expect(WithdrawalModel.findOneAndUpdate).toHaveBeenCalledWith(
      { _id: 'withdrawal-id', status: 'PENDING' },
      expect.objectContaining({ $set: expect.objectContaining({ status: 'COMPLETED', paymentReference: 'PAY-1' }) }),
      { new: true }
    );
    expect(SellerModel.updateOne).toHaveBeenCalledWith({ _id: 'seller-id' }, { $inc: { pendingWithdrawals: -50 } });
  });

  it('rejects a pending withdrawal and returns the amount to available balance', async () => {
    const withdrawal = {
      _id: 'withdrawal-id',
      sellerId: 'seller-id',
      amount: 75,
      status: 'REJECTED',
      processedDate: new Date(),
      bankInfo: { bankName: 'VCB', accountNumber: '123456', accountName: 'SELLER' },
      adminNote: 'Invalid account',
      paymentReference: ''
    };
    (WithdrawalModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(withdrawal) });
    (SellerModel.updateOne as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }) });

    await updateWithdrawalStatus('withdrawal-id', {
      status: 'REJECTED',
      adminNote: 'Invalid account'
    });

    expect(SellerModel.updateOne).toHaveBeenCalledWith(
      { _id: 'seller-id' },
      { $inc: { pendingWithdrawals: -75, availableBalance: 75 } }
    );
  });

  it('rejects processing a withdrawal that is no longer pending', async () => {
    (WithdrawalModel.findOneAndUpdate as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });

    await expect(updateWithdrawalStatus('withdrawal-id', { status: 'COMPLETED' })).rejects.toThrow(
      'Withdrawal is not pending or does not exist'
    );
    expect(SellerModel.updateOne).not.toHaveBeenCalled();
  });
});
