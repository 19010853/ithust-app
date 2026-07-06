import { IBuyerDocument } from 'src/features/buyer/interfaces/buyer.interface';
import { ISellerDocument } from 'src/features/sellers/interfaces/seller.interface';

export interface IPagination {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

export interface IAdminUserSearchItem {
  _id?: string;
  buyerId?: string;
  country?: string;
  createdAt?: Date | string;
  email?: string;
  isSeller: boolean;
  accountStatus?: 'ACTIVE' | 'ACCOUNT_LOCKED';
  sellerStatus?: 'ACTIVE' | 'SELLER_RESTRICTED';
  profilePicture?: string;
  sellerId?: string;
  sellerSummary?: {
    availableBalance?: number;
    completedJobs?: number;
    ongoingJobs?: number;
    pendingWithdrawals?: number;
    ratingsCount?: number;
    ratingSum?: number;
    totalEarnings?: number;
  };
  username?: string;
}

export interface IAdminUserDetail {
  buyer: IBuyerDocument | null;
  seller: ISellerDocument | null;
  summary: {
    availableBalance?: number;
    cancelledJobs?: number;
    completedJobs?: number;
    ongoingJobs?: number;
    pendingWithdrawals?: number;
    ratingSum?: number;
    ratingsCount?: number;
    totalEarnings?: number;
    totalGigs?: number;
  };
}

export interface IRestrictionPreview {
  accountStatus: 'ACTIVE' | 'ACCOUNT_LOCKED';
  activeBuyerOrders: number;
  activeGigs: number;
  activeSellerOrders: number;
  availableBalance: number;
  identity: {
    buyerId?: string;
    country?: string;
    email?: string;
    profilePicture?: string;
    sellerId?: string;
    username?: string;
  };
  pendingWithdrawals: number;
  sellerStatus: 'ACTIVE' | 'SELLER_RESTRICTED';
}

export interface IRestrictionStatusPayload {
  reason: string;
  status: 'ACTIVE' | 'ACCOUNT_LOCKED' | 'SELLER_RESTRICTED';
}

export interface IAdminUserFilters {
  country?: string;
  isSeller?: string;
  limit?: number;
  page?: number;
  q?: string;
}

export interface IWithdrawalFilters {
  bankName?: string;
  createdFrom?: string;
  createdTo?: string;
  limit?: number;
  maxAmount?: string;
  minAmount?: string;
  page?: number;
  processedFrom?: string;
  processedTo?: string;
  q?: string;
  sellerEmail?: string;
  sellerUsername?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
}
