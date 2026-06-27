import { gigService } from '@gateway/services/api/gig.service';
import { sellerService } from '@gateway/services/api/seller.service';
import { assertGigCanReceiveNewOrders, assertGigOwner } from '@gateway/services/restriction.service';
import { IAuthPayload } from '@19010853/ithust-shared';

jest.mock('@gateway/services/api/gig.service', () => ({
  gigService: {
    getGigById: jest.fn()
  }
}));

jest.mock('@gateway/services/api/seller.service', () => ({
  sellerService: {
    getSellerById: jest.fn()
  }
}));

jest.mock('@gateway/services/api/order.service', () => ({
  orderService: {
    getOrderById: jest.fn()
  }
}));

describe('Gateway restriction service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects gig active changes from a non-owner', async () => {
    (gigService.getGigById as jest.Mock).mockResolvedValue({
      data: {
        gig: {
          id: 'gig-id',
          username: 'seller-one',
          sellerId: 'seller-id',
          active: true
        }
      }
    });
    (sellerService.getSellerById as jest.Mock).mockResolvedValue({
      data: {
        seller: {
          _id: 'seller-id',
          username: 'seller-one',
          email: 'seller-one@test.com'
        }
      }
    });

    await expect(
      assertGigOwner('gig-id', { username: 'seller-two', email: 'seller-two@test.com', id: 2 } as unknown as IAuthPayload)
    ).rejects.toThrow('You are not allowed to manage this seller profile gigs.');
  });

  it('allows gig active changes from the owner', async () => {
    (gigService.getGigById as jest.Mock).mockResolvedValue({
      data: {
        gig: {
          id: 'gig-id',
          username: 'seller-one',
          sellerId: 'seller-id',
          active: true
        }
      }
    });
    (sellerService.getSellerById as jest.Mock).mockResolvedValue({
      data: {
        seller: {
          _id: 'seller-id',
          username: 'seller-one',
          email: 'seller-one@test.com'
        }
      }
    });

    await expect(
      assertGigOwner('gig-id', { username: 'Seller-One', email: 'seller-one@test.com', id: 1 } as unknown as IAuthPayload)
    ).resolves.toMatchObject({ id: 'gig-id' });
  });

  it('rejects new orders for paused gigs', async () => {
    (gigService.getGigById as jest.Mock).mockResolvedValue({
      data: {
        gig: {
          id: 'gig-id',
          username: 'seller-one',
          sellerId: 'seller-id',
          active: false
        }
      }
    });

    await expect(assertGigCanReceiveNewOrders('gig-id')).rejects.toThrow('This gig is currently paused and cannot receive new orders.');
    expect(sellerService.getSellerById).not.toHaveBeenCalled();
  });

  it('allows new orders for active gigs when seller can receive marketplace activity', async () => {
    (gigService.getGigById as jest.Mock).mockResolvedValue({
      data: {
        gig: {
          id: 'gig-id',
          username: 'seller-one',
          sellerId: 'seller-id',
          active: true
        }
      }
    });
    (sellerService.getSellerById as jest.Mock).mockResolvedValue({
      data: {
        seller: {
          _id: 'seller-id',
          sellerStatus: 'ACTIVE',
          accountStatus: 'ACTIVE'
        }
      }
    });

    await expect(assertGigCanReceiveNewOrders('gig-id')).resolves.toBeUndefined();
  });
});
