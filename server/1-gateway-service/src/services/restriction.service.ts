import { gigService } from '@gateway/services/api/gig.service';
import { orderService } from '@gateway/services/api/order.service';
import { sellerService } from '@gateway/services/api/seller.service';
import { BadRequestError } from '@19010853/ithust-shared';

const SELLER_RESTRICTED_STATUSES = ['SELLER_RESTRICTED', 'SELLER_LOCKED_HARD'];

const getSellerById = async (sellerId: string): Promise<any> => {
  const response = await sellerService.getSellerById(sellerId);
  return response.data.seller;
};

const assertSellerCanOpenMarketplaceActivity = async (sellerId: string): Promise<void> => {
  const seller = await getSellerById(sellerId);
  if (!seller) {
    throw new BadRequestError('Seller profile not found.', 'Gateway restriction check');
  }
  if (seller.accountStatus === 'ACCOUNT_LOCKED') {
    throw new BadRequestError('This account is locked.', 'Gateway restriction check');
  }
  if (SELLER_RESTRICTED_STATUSES.includes(`${seller.sellerStatus || 'ACTIVE'}`)) {
    throw new BadRequestError('This seller cannot create gigs or receive new orders.', 'Gateway restriction check');
  }
};

const assertSellerCanWithdraw = async (sellerId: string): Promise<void> => {
  const seller = await getSellerById(sellerId);
  if (!seller) {
    throw new BadRequestError('Seller profile not found.', 'Gateway withdrawal restriction check');
  }
  if (seller.accountStatus === 'ACCOUNT_LOCKED' || seller.sellerStatus === 'SELLER_LOCKED_HARD') {
    throw new BadRequestError('Withdrawals are disabled for this account.', 'Gateway withdrawal restriction check');
  }
};

const assertSellerNotHardLocked = async (sellerId: string): Promise<void> => {
  const seller = await getSellerById(sellerId);
  if (!seller) {
    throw new BadRequestError('Seller profile not found.', 'Gateway seller action restriction check');
  }
  if (seller.accountStatus === 'ACCOUNT_LOCKED' || seller.sellerStatus === 'SELLER_LOCKED_HARD') {
    throw new BadRequestError('Seller actions are locked pending admin review.', 'Gateway seller action restriction check');
  }
};

const assertGigSellerCanOpenMarketplaceActivity = async (gigId: string): Promise<void> => {
  const response = await gigService.getGigById(gigId);
  const gig = response.data.gig;
  if (gig?.sellerId) {
    await assertSellerCanOpenMarketplaceActivity(`${gig.sellerId}`);
  }
};

const getGigForRestrictionCheck = async (gigId: string): Promise<any> => {
  const response = await gigService.getGigById(gigId);
  const gig = response.data.gig;
  if (!gig) {
    throw new BadRequestError('Gig not found.', 'Gateway gig restriction check');
  }
  return gig;
};

const assertGigOwner = async (gigId: string, username?: string): Promise<any> => {
  const gig = await getGigForRestrictionCheck(gigId);
  if (!username || `${gig.username}`.toLowerCase() !== `${username}`.toLowerCase()) {
    throw new BadRequestError('You are not allowed to update this gig.', 'Gateway gig owner check');
  }
  return gig;
};

const assertGigCanReceiveNewOrders = async (gigId: string): Promise<void> => {
  const gig = await getGigForRestrictionCheck(gigId);
  if (gig.active === false) {
    throw new BadRequestError('This gig is currently paused and cannot receive new orders.', 'Gateway gig order check');
  }
  if (gig?.sellerId) {
    await assertSellerCanOpenMarketplaceActivity(`${gig.sellerId}`);
  }
};

const assertOrderSellerNotHardLocked = async (orderId: string): Promise<void> => {
  const response = await orderService.getOrderById(orderId);
  const order = response.data.order;
  if (order?.sellerId) {
    await assertSellerNotHardLocked(`${order.sellerId}`);
  }
};

export {
  assertSellerCanOpenMarketplaceActivity,
  assertGigSellerCanOpenMarketplaceActivity,
  assertGigCanReceiveNewOrders,
  assertGigOwner,
  assertOrderSellerNotHardLocked,
  assertSellerCanWithdraw
};
