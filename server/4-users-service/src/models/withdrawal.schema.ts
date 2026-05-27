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
    status: { type: String, enum: ['PENDING', 'COMPLETED', 'REJECTED'], default: 'PENDING' },
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
