import { Model, Schema, model } from 'mongoose';

const withdrawalSchema: Schema = new Schema(
  {
    sellerId: { type: Schema.Types.ObjectId, required: true, ref: 'Seller' },
    amount: { type: Number, required: true },
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
    provider: { type: String, enum: ['STRIPE_CONNECT', 'MANUAL_BANK'], default: 'MANUAL_BANK', index: true },
    stripeAccountId: { type: String, default: '', index: true },
    providerTransferId: { type: String, default: '', index: true },
    providerPayoutId: { type: String, default: '', index: true },
    payoutStatus: { type: String, default: '' },
    providerAmount: { type: String, default: '' },
    providerCurrency: { type: String, default: '' },
    providerFailureCode: { type: String, default: '' },
    providerFailureMessage: { type: String, default: '' },
    failureReason: { type: String, default: '' },
    reconciliationStatus: { type: String, enum: ['NONE', 'REQUIRED'], default: 'NONE' },
    createdAt: { type: Date, default: Date.now },
    processedDate: { type: Date, default: null },
    processedBy: {
      id: { type: Number, default: null },
      username: { type: String, default: '' },
      email: { type: String, default: '' }
    },
    adminNote: { type: String, default: '' },
    paymentReference: { type: String, default: '' }
  },
  {
    versionKey: false
  }
);

const WithdrawalModel: Model<any> = model('Withdrawal', withdrawalSchema, 'Withdrawal');
export { WithdrawalModel };
