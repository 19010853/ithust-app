import { updateSellerCompletedJobsProp } from '@users/services/seller.service';
import { SellerModel } from '@users/models/seller.schema';

jest.mock('@users/models/seller.schema', () => ({
  SellerModel: {
    updateOne: jest.fn()
  }
}));

jest.mock('@users/services/buyer.service');

describe('Seller service', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('releases completed order earnings into the available balance', async () => {
    const exec = jest.fn().mockResolvedValue(undefined);
    (SellerModel.updateOne as jest.Mock).mockReturnValue({ exec });

    await updateSellerCompletedJobsProp({
      sellerId: 'seller-id',
      ongoingJobs: -1,
      completedJobs: 1,
      totalEarnings: 80000,
      recentDelivery: '2026-05-21T12:00:00.000Z'
    } as never);

    expect(SellerModel.updateOne).toHaveBeenCalledWith(
      { _id: 'seller-id' },
      {
        $inc: {
          ongoingJobs: -1,
          completedJobs: 1,
          totalEarnings: 80000,
          availableBalance: 80000
        },
        $set: { recentDelivery: new Date('2026-05-21T12:00:00.000Z') }
      }
    );
    expect(exec).toHaveBeenCalled();
  });
});
