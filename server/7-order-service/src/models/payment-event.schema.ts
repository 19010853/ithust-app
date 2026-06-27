import { Model, Schema, model } from 'mongoose';

export interface IPaymentEventDocument {
  provider: 'stripe' | 'paypal' | 'sepay';
  providerEventId: string;
  eventType: string;
  orderId?: string;
  providerPaymentId?: string;
  amount?: number;
  currency?: string;
  reference?: string;
  payloadHash: string;
  processingResult: 'RECEIVED' | 'PROCESSED' | 'IGNORED' | 'RECONCILIATION_REQUIRED';
  processingMessage?: string;
}

const paymentEventSchema = new Schema(
  {
    provider: { type: String, enum: ['stripe', 'paypal', 'sepay'], required: true, index: true },
    providerEventId: { type: String, required: true },
    eventType: { type: String, required: true },
    orderId: { type: String, index: true },
    providerPaymentId: { type: String, index: true },
    amount: { type: Number },
    currency: { type: String },
    reference: { type: String },
    payloadHash: { type: String, required: true },
    processingResult: {
      type: String,
      enum: ['RECEIVED', 'PROCESSED', 'IGNORED', 'RECONCILIATION_REQUIRED'],
      default: 'RECEIVED',
      index: true
    },
    processingMessage: { type: String, default: '' }
  },
  { timestamps: true, versionKey: false }
);

paymentEventSchema.index({ provider: 1, providerEventId: 1 }, { unique: true });

export const PaymentEventModel: Model<IPaymentEventDocument> = model<IPaymentEventDocument>(
  'PaymentEvent',
  paymentEventSchema,
  'PaymentEvent'
);
