import { Model, Schema, model } from 'mongoose';

export interface IDisputeDocument {
  _id?: string;
  orderId: string;
  buyerUsername: string;
  sellerUsername: string;
  reason: string;
  evidence: Array<{ url: string; fileName?: string; fileType?: string }>;
  status: 'OPEN' | 'SELLER_RESPONSE_REQUIRED' | 'REVISION_REQUIRED' | 'REFUND_BUYER' | 'RELEASE_SELLER' | 'CLOSED';
  sellerResponseDeadlineAt: Date;
  revisionDeadlineAt?: Date;
  decisionReason?: string;
  decidedBy?: { id?: number; username?: string; email?: string };
  decidedAt?: Date;
}

const disputeSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    buyerUsername: { type: String, required: true, index: true },
    sellerUsername: { type: String, required: true, index: true },
    reason: { type: String, required: true },
    evidence: [{ url: { type: String, required: true }, fileName: String, fileType: String }],
    status: {
      type: String,
      enum: ['OPEN', 'SELLER_RESPONSE_REQUIRED', 'REVISION_REQUIRED', 'REFUND_BUYER', 'RELEASE_SELLER', 'CLOSED'],
      default: 'SELLER_RESPONSE_REQUIRED',
      index: true
    },
    sellerResponseDeadlineAt: { type: Date, required: true, index: true },
    revisionDeadlineAt: Date,
    decisionReason: { type: String, default: '' },
    decidedBy: { id: Number, username: String, email: String },
    decidedAt: Date
  },
  { timestamps: true, versionKey: false }
);

export const DisputeModel: Model<IDisputeDocument> = model<IDisputeDocument>('Dispute', disputeSchema, 'Dispute');
