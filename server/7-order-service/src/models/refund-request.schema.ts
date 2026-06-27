import { model, Model, Schema } from 'mongoose';

export interface IRefundRequestDocument {
  _id?: string;
  orderId: string;
  orderMongoId?: string;
  buyerId: string;
  buyerUsername: string;
  buyerEmail: string;
  paidAmountVnd: number;
  reason: string;
  bankInfo?: {
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
  };
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'FAILED' | 'MANUAL_REVIEW' | 'RECONCILIATION_REQUIRED';
  providerRefundId?: string;
  trigger?: 'BUYER_REQUEST' | 'EXTENSION_REJECTED' | 'OVERDUE_AUTO' | 'QUALITY_DISPUTE';
  decisionSource?: 'BUYER' | 'ADMIN' | 'POLICY';
  settlementMode?: 'ORIGINAL_SOURCE';
  processedAt?: Date;
  failureReason?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const refundRequestSchema: Schema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    orderMongoId: { type: String },
    buyerId: { type: String, required: true, index: true },
    buyerUsername: { type: String, required: true },
    buyerEmail: { type: String, required: true },
    paidAmountVnd: { type: Number, required: true },
    reason: { type: String, required: true },
    bankInfo: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountName: { type: String, default: '' }
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'REJECTED', 'FAILED', 'MANUAL_REVIEW', 'RECONCILIATION_REQUIRED'],
      default: 'PENDING'
    },
    providerRefundId: { type: String, default: '' },
    trigger: { type: String, enum: ['BUYER_REQUEST', 'EXTENSION_REJECTED', 'OVERDUE_AUTO', 'QUALITY_DISPUTE'], default: 'BUYER_REQUEST' },
    decisionSource: { type: String, enum: ['BUYER', 'ADMIN', 'POLICY'], default: 'BUYER' },
    settlementMode: { type: String, enum: ['ORIGINAL_SOURCE'], default: 'ORIGINAL_SOURCE' },
    processedAt: { type: Date },
    failureReason: { type: String, default: '' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const RefundRequestModel: Model<IRefundRequestDocument> = model<IRefundRequestDocument>('RefundRequest', refundRequestSchema, 'RefundRequest');
export { RefundRequestModel };
