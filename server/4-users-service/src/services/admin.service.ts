import { BuyerModel } from '@users/models/buyer.schema';
import { SellerModel } from '@users/models/seller.schema';
import { IBuyerDocument, ISellerDocument } from '@19010853/ithust-shared';

interface IAdminUserQuery {
  country?: string;
  isSeller?: string;
  limit?: string;
  page?: string;
  q?: string;
}

interface IPagination {
  limit: number;
  page: number;
  total: number;
  totalPages: number;
}

interface IAdminUserSearchItem {
  _id: unknown;
  buyerId?: unknown;
  sellerId?: unknown;
  username?: string;
  email?: string;
  country?: string;
  profilePicture?: string;
  isSeller: boolean;
  createdAt?: Date | string;
  sellerSummary?: {
    availableBalance: number;
    completedJobs: number;
    ongoingJobs: number;
    pendingWithdrawals: number;
    ratingsCount: number;
    ratingSum: number;
    totalEarnings: number;
  };
}

const parsePositiveInt = (value: string | undefined, fallback: number, max = 100): number => {
  const parsed = parseInt(`${value || ''}`, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }
  return Math.min(parsed, max);
};

const buildTextQuery = (q?: string) => {
  const trimmed = q?.trim();
  if (!trimmed) {
    return {};
  }
  const regex = new RegExp(trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return {
    $or: [{ username: regex }, { email: regex }, { fullName: regex }]
  };
};

const buildSellerSummary = (seller: ISellerDocument): NonNullable<IAdminUserSearchItem['sellerSummary']> => ({
  availableBalance: Number(seller.availableBalance || 0),
  pendingWithdrawals: Number(seller.pendingWithdrawals || 0),
  totalEarnings: Number(seller.totalEarnings || 0),
  completedJobs: Number(seller.completedJobs || 0),
  ongoingJobs: Number(seller.ongoingJobs || 0),
  ratingsCount: Number(seller.ratingsCount || 0),
  ratingSum: Number(seller.ratingSum || 0)
});

const getAdminUsers = async (query: IAdminUserQuery): Promise<{ users: IAdminUserSearchItem[]; pagination: IPagination; filters: IAdminUserQuery }> => {
  const page = parsePositiveInt(query.page, 1);
  const limit = parsePositiveInt(query.limit, 20);
  const skip = (page - 1) * limit;
  const textQuery = buildTextQuery(query.q);
  const countryQuery = query.country?.trim() ? { country: new RegExp(query.country.trim(), 'i') } : {};
  const isSellerFilter = query.isSeller;

  const [buyers, sellers] = await Promise.all([
    isSellerFilter === 'true' ? Promise.resolve([]) : BuyerModel.find({ ...textQuery, ...countryQuery }).lean().exec(),
    isSellerFilter === 'false' ? Promise.resolve([]) : SellerModel.find({ ...textQuery, ...countryQuery }).lean().exec()
  ]);

  const sellerByEmail = new Map<string, ISellerDocument>();
  (sellers as ISellerDocument[]).forEach((seller) => {
    if (seller.email) {
      sellerByEmail.set(`${seller.email}`.toLowerCase(), seller);
    }
  });

  const users: IAdminUserSearchItem[] = (buyers as IBuyerDocument[]).map((buyer) => {
    const seller = sellerByEmail.get(`${buyer.email}`.toLowerCase());
    return {
      _id: buyer._id,
      buyerId: buyer._id,
      sellerId: seller?._id,
      username: buyer.username,
      email: buyer.email,
      country: buyer.country,
      profilePicture: buyer.profilePicture,
      isSeller: Boolean(seller || buyer.isSeller),
      createdAt: buyer.createdAt,
      sellerSummary: seller ? buildSellerSummary(seller) : undefined
    };
  });

  (sellers as ISellerDocument[]).forEach((seller) => {
    const hasBuyer = (buyers as IBuyerDocument[]).some((buyer) => `${buyer.email}`.toLowerCase() === `${seller.email}`.toLowerCase());
    if (!hasBuyer) {
      users.push({
        _id: seller._id,
        sellerId: seller._id,
        username: seller.username,
        email: seller.email,
        country: seller.country,
        profilePicture: seller.profilePicture,
        isSeller: true,
        createdAt: seller.createdAt,
        sellerSummary: buildSellerSummary(seller)
      });
    }
  });

  users.sort((a: any, b: any) => `${a.username}`.localeCompare(`${b.username}`));
  const total = users.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    users: users.slice(skip, skip + limit),
    pagination: { page, limit, total, totalPages },
    filters: query
  };
};

const getAdminUserDetail = async (username: string): Promise<{ buyer: IBuyerDocument | null; seller: ISellerDocument | null; summary: unknown }> => {
  const [buyer, seller] = await Promise.all([
    BuyerModel.findOne({ username }).lean().exec(),
    SellerModel.findOne({ username }).lean().exec()
  ]);

  return {
    buyer: buyer as IBuyerDocument | null,
    seller: seller as ISellerDocument | null,
    summary: seller
      ? {
          totalEarnings: seller.totalEarnings || 0,
          availableBalance: seller.availableBalance || 0,
          pendingWithdrawals: seller.pendingWithdrawals || 0,
          completedJobs: seller.completedJobs || 0,
          ongoingJobs: seller.ongoingJobs || 0,
          cancelledJobs: seller.cancelledJobs || 0,
          totalGigs: seller.totalGigs || 0,
          ratingsCount: seller.ratingsCount || 0,
          ratingSum: seller.ratingSum || 0
        }
      : {}
  };
};

export { getAdminUsers, getAdminUserDetail, IAdminUserQuery };
