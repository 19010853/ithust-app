import { Model, Schema, model } from 'mongoose';

const adminAuditSchema: Schema = new Schema(
  {
    adminId: { type: Number },
    adminUsername: { type: String },
    adminEmail: { type: String },
    targetUsername: { type: String, required: true, index: true },
    action: { type: String, required: true },
    previousStatus: { type: String, default: '' },
    nextStatus: { type: String, required: true },
    reason: { type: String, default: '' },
    activeBuyerOrders: { type: Number, default: 0 },
    activeSellerOrders: { type: Number, default: 0 },
    pendingWithdrawals: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    activeGigs: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
  },
  { versionKey: false }
);

const AdminAuditModel: Model<any> = model<any>('AdminAudit', adminAuditSchema, 'AdminAudit');
export { AdminAuditModel };
