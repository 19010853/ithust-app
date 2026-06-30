import { BuyerModel } from '@users/models/buyer.schema';
import { SellerModel } from '@users/models/seller.schema';
import { AdminAuditModel } from '@users/models/admin-audit.schema';
import { BadRequestError } from '@19010853/ithust-shared';
import { IBuyerDocument, ISellerDocument } from '@19010853/ithust-shared';
import { publishDirectMessage } from '@users/queues/user.producer';
import { Channel } from 'amqplib';
import { config } from '@users/config';

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
  accountStatus?: string;
  sellerStatus?: string;
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

interface IAdminActor {
  id?: number;
  username?: string;
  email?: string;
}

interface IRestrictionSnapshot {
  activeBuyerOrders?: number;
  activeSellerOrders?: number;
  pendingWithdrawals?: number;
  availableBalance?: number;
  activeGigs?: number;
}

interface IStatusUpdateData {
  admin?: IAdminActor;
  preview?: IRestrictionSnapshot;
  reason?: string;
  status: string;
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
      accountStatus: (buyer as IBuyerDocument & { accountStatus?: string }).accountStatus || 'ACTIVE',
      sellerStatus: seller ? ((seller as ISellerDocument & { sellerStatus?: string }).sellerStatus || 'ACTIVE') : undefined,
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
        accountStatus: (seller as ISellerDocument & { accountStatus?: string }).accountStatus || 'ACTIVE',
        sellerStatus: (seller as ISellerDocument & { sellerStatus?: string }).sellerStatus || 'ACTIVE',
        createdAt: seller.createdAt,
        sellerSummary: buildSellerSummary(seller)
      });
    }
  });

  const adminEmail = config.PLATFORM_OWNER_EMAIL?.toLowerCase();
  const filteredUsers = adminEmail ? users.filter((u) => `${u.email}`.toLowerCase() !== adminEmail) : users;

  filteredUsers.sort((a: any, b: any) => `${a.username}`.localeCompare(`${b.username}`));
  const total = filteredUsers.length;
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  return {
    users: filteredUsers.slice(skip, skip + limit),
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

const getRestrictionPreview = async (username: string): Promise<{
  identity: {
    buyerId?: unknown;
    sellerId?: unknown;
    username?: string;
    email?: string;
    country?: string;
    profilePicture?: string;
  };
  accountStatus: string;
  sellerStatus: string;
  activeBuyerOrders: number;
  activeSellerOrders: number;
  pendingWithdrawals: number;
  availableBalance: number;
  activeGigs: number;
}> => {
  const adminUser = await getAdminUserDetail(username);
  if (!adminUser.buyer && !adminUser.seller) {
    throw new BadRequestError('User not found', 'getRestrictionPreview()');
  }
  const buyer = adminUser.buyer as (IBuyerDocument & { accountStatus?: string }) | null;
  const seller = adminUser.seller as (ISellerDocument & { accountStatus?: string; sellerStatus?: string }) | null;
  return {
    identity: {
      buyerId: buyer?._id,
      sellerId: seller?._id,
      username: buyer?.username || seller?.username,
      email: buyer?.email || seller?.email,
      country: buyer?.country || seller?.country,
      profilePicture: buyer?.profilePicture || seller?.profilePicture
    },
    accountStatus: buyer?.accountStatus || seller?.accountStatus || 'ACTIVE',
    sellerStatus: seller?.sellerStatus || 'ACTIVE',
    activeBuyerOrders: 0,
    activeSellerOrders: 0,
    pendingWithdrawals: Number(seller?.pendingWithdrawals || 0),
    availableBalance: Number(seller?.availableBalance || 0),
    activeGigs: 0
  };
};

const writeAudit = async (
  targetUsername: string,
  action: string,
  previousStatus: string,
  nextStatus: string,
  data: IStatusUpdateData
): Promise<void> => {
  await AdminAuditModel.create({
    adminId: data.admin?.id,
    adminUsername: data.admin?.username,
    adminEmail: data.admin?.email,
    targetUsername,
    action,
    previousStatus,
    nextStatus,
    reason: data.reason || '',
    activeBuyerOrders: data.preview?.activeBuyerOrders || 0,
    activeSellerOrders: data.preview?.activeSellerOrders || 0,
    pendingWithdrawals: data.preview?.pendingWithdrawals || 0,
    availableBalance: data.preview?.availableBalance || 0,
    activeGigs: data.preview?.activeGigs || 0
  });
};

const sendRestrictionNotification = async (
  targetUsername: string,
  email: string | undefined,
  status: string,
  reason?: string
): Promise<void> => {
  if (!email) {
    return;
  }
  await publishDirectMessage(
    undefined as unknown as Channel,
    'ithust-email-notification',
    'auth-email',
    JSON.stringify({
      receiverEmail: email,
      username: targetUsername,
      template: 'restrictionStatus',
      status,
      reason: reason || '',
      message:
        status === 'ACCOUNT_LOCKED'
          ? 'Your account is locked. Contact support for help.'
          : status === 'SELLER_RESTRICTED'
            ? 'Your seller capability is restricted. You can still complete active orders.'
            : status === 'SELLER_LOCKED_HARD'
              ? 'Your seller capability is locked pending admin review.'
              : 'Your account or seller capability has been restored.'
    }),
    'Restriction status email sent to notification service.'
  );
};

const updateAccountStatus = async (username: string, data: IStatusUpdateData): Promise<{ buyer: IBuyerDocument | null; seller: ISellerDocument | null }> => {
  if (!['ACTIVE', 'ACCOUNT_LOCKED'].includes(data.status)) {
    throw new BadRequestError('Invalid account status', 'updateAccountStatus()');
  }
  const current = await getRestrictionPreview(username);
  await Promise.all([
    BuyerModel.updateOne({ username }, { $set: { accountStatus: data.status } }).exec(),
    SellerModel.updateOne({ username }, { $set: { accountStatus: data.status } }).exec()
  ]);
  await writeAudit(username, 'ACCOUNT_STATUS', current.accountStatus, data.status, data);
  const updated = await getAdminUserDetail(username);
  await sendRestrictionNotification(username, updated.buyer?.email || updated.seller?.email, data.status, data.reason);
  return { buyer: updated.buyer, seller: updated.seller };
};

const updateSellerStatus = async (username: string, data: IStatusUpdateData): Promise<ISellerDocument> => {
  if (!['ACTIVE', 'SELLER_RESTRICTED', 'SELLER_LOCKED_HARD'].includes(data.status)) {
    throw new BadRequestError('Invalid seller status', 'updateSellerStatus()');
  }
  const seller = (await SellerModel.findOne({ username }).exec()) as (ISellerDocument & { sellerStatus?: string }) | null;
  if (!seller) {
    throw new BadRequestError('Seller profile is required.', 'updateSellerStatus()');
  }
  const previousStatus = seller.sellerStatus || 'ACTIVE';
  const updated = (await SellerModel.findOneAndUpdate(
    { username },
    {
      $set: {
        sellerStatus: data.status,
        sellerStatusReason: data.status === 'ACTIVE' ? '' : data.reason || '',
        sellerStatusUpdatedAt: new Date(),
        sellerStatusUpdatedBy: data.admin || {}
      }
    },
    { new: true }
  ).exec()) as ISellerDocument;
  await writeAudit(username, 'SELLER_STATUS', previousStatus, data.status, data);
  await sendRestrictionNotification(username, updated.email, data.status, data.reason);
  return updated;
};

export { getAdminUsers, getAdminUserDetail, getRestrictionPreview, updateAccountStatus, updateSellerStatus, IAdminUserQuery };
