import { Model, Schema, model } from 'mongoose';

export interface IBalanceLedgerDocument {
  ownerType: 'BUYER_REFUND' | 'SELLER_EARNINGS';
  ownerId: string;
  entryType: 'REFUND_CREDIT' | 'WITHDRAWAL_RESERVE' | 'WITHDRAWAL_RELEASE' | 'WITHDRAWAL_RESTORE';
  amount: number;
  businessReference: string;
  orderId?: string;
  withdrawalId?: string;
}

const balanceLedgerSchema = new Schema(
  {
    ownerType: { type: String, enum: ['BUYER_REFUND', 'SELLER_EARNINGS'], required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, required: true, index: true },
    entryType: {
      type: String,
      enum: ['REFUND_CREDIT', 'WITHDRAWAL_RESERVE', 'WITHDRAWAL_RELEASE', 'WITHDRAWAL_RESTORE'],
      required: true
    },
    amount: { type: Number, required: true },
    businessReference: { type: String, required: true, unique: true },
    orderId: { type: String, index: true },
    withdrawalId: { type: String, index: true }
  },
  { timestamps: true, versionKey: false }
);

export const BalanceLedgerModel: Model<IBalanceLedgerDocument> = model<IBalanceLedgerDocument>(
  'BalanceLedger',
  balanceLedgerSchema,
  'BalanceLedger'
);
