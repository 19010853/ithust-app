export interface IBuyerDocument {
  _id?: string;
  username?: string;
  email?: string;
  profilePicture?: string;
  country: string;
  accountStatus?: 'ACTIVE' | 'ACCOUNT_LOCKED';
  isSeller?: boolean;
  refundAvailableBalance?: number;
  refundPendingWithdrawals?: number;
  purchasedGigs: string[];
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface IReduxBuyer {
  type?: string;
  payload: IBuyerDocument;
}
