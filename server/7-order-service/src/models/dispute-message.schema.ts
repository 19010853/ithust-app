import { Model, Schema, model } from 'mongoose';

export interface IDisputeMessageDocument {
  disputeId: string;
  orderId: string;
  senderUsername: string;
  senderRole: 'buyer' | 'seller' | 'admin';
  visibility: 'PARTICIPANTS' | 'ADMIN_INTERNAL';
  body: string;
  attachments: Array<{ url: string; fileName?: string; fileType?: string }>;
}

const disputeMessageSchema = new Schema(
  {
    disputeId: { type: Schema.Types.ObjectId, required: true, ref: 'Dispute', index: true },
    orderId: { type: String, required: true, index: true },
    senderUsername: { type: String, required: true },
    senderRole: { type: String, enum: ['buyer', 'seller', 'admin'], required: true },
    visibility: { type: String, enum: ['PARTICIPANTS', 'ADMIN_INTERNAL'], default: 'PARTICIPANTS' },
    body: { type: String, required: true },
    attachments: [{ url: { type: String, required: true }, fileName: String, fileType: String }]
  },
  { timestamps: true, versionKey: false }
);

export const DisputeMessageModel: Model<IDisputeMessageDocument> = model<IDisputeMessageDocument>(
  'DisputeMessage',
  disputeMessageSchema,
  'DisputeMessage'
);
