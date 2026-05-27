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
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
  status: 'PENDING';
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
      bankName: { type: String, required: true },
      accountNumber: { type: String, required: true },
      accountName: { type: String, required: true }
    },
    status: { type: String, enum: ['PENDING'], default: 'PENDING' }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const RefundRequestModel: Model<IRefundRequestDocument> = model<IRefundRequestDocument>('RefundRequest', refundRequestSchema, 'RefundRequest');
export { RefundRequestModel };
