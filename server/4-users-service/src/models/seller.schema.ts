import { ISellerDocument } from '@19010853/ithust-shared';
import { Model, Schema, model } from 'mongoose';

const sellerSchema: Schema = new Schema(
  {
    fullName: { type: String, required: true },
    username: { type: String, required: true, index: true },
    email: { type: String, required: true, index: true },
    profilePicture: { type: String, required: true },
    description: { type: String, required: true },
    profilePublicId: { type: String, required: true },
    oneliner: { type: String, default: '' },
    country: { type: String, required: true },
    accountStatus: { type: String, enum: ['ACTIVE', 'ACCOUNT_LOCKED'], default: 'ACTIVE' },
    sellerStatus: { type: String, enum: ['ACTIVE', 'SELLER_RESTRICTED', 'SELLER_LOCKED_HARD'], default: 'ACTIVE' },
    sellerStatusReason: { type: String, default: '' },
    sellerStatusUpdatedAt: { type: Date },
    sellerStatusUpdatedBy: {
      id: { type: Number },
      username: { type: String },
      email: { type: String }
    },
    languages: [
      {
        language: { type: String, required: true },
        level: { type: String, required: true }
      }
    ],
    skills: [{ type: String, required: true }],
    ratingsCount: { type: Number, default: 0 },
    ratingSum: { type: Number, default: 0 },
    ratingCategories: {
      five: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      four: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      three: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      two: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } },
      one: { value: { type: Number, default: 0 }, count: { type: Number, default: 0 } }
    },
    responseTime: { type: Number, default: 0 },
    recentDelivery: { type: Date, default: '' },
    experience: [
      {
        company: { type: String, default: '' },
        title: { type: String, default: '' },
        startDate: { type: String, default: '' },
        endDate: { type: String, default: '' },
        description: { type: String, default: '' },
        currentlyWorkingHere: { type: Boolean, default: false }
      }
    ],
    education: [
      {
        country: { type: String, default: '' },
        university: { type: String, default: '' },
        title: { type: String, default: '' },
        major: { type: String, default: '' },
        year: { type: String, default: '' }
      }
    ],
    socialLinks: [{ type: String, default: '' }],
    certificates: [
      {
        name: { type: String },
        from: { type: String },
        year: { type: Number }
      }
    ],
    ongoingJobs: { type: Number, default: 0 },
    completedJobs: { type: Number, default: 0 },
    cancelledJobs: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    totalGigs: { type: Number, default: 0 },
    availableBalance: { type: Number, default: 0 },
    pendingWithdrawals: { type: Number, default: 0 },
    stripeAccountId: { type: String, default: '', index: true },
    stripeOnboardingStatus: { type: String, enum: ['NOT_STARTED', 'PENDING', 'COMPLETED'], default: 'NOT_STARTED' },
    stripePayoutReadiness: { type: String, enum: ['NOT_STARTED', 'RESTRICTED', 'READY'], default: 'NOT_STARTED' },
    payoutsEnabled: { type: Boolean, default: false },
    chargesEnabled: { type: Boolean, default: false },
    stripeDetailsSubmitted: { type: Boolean, default: false },
    stripeExternalAccountReady: { type: Boolean, default: false },
    stripeRequirementsCurrentlyDue: [{ type: String, default: '' }],
    stripeRequirementsPastDue: [{ type: String, default: '' }],
    stripeRequirementsDisabledReason: { type: String, default: '' },
    bankAccount: {
      bankName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      accountName: { type: String, default: '' }
    },
    createdAt: { type: Date, default: Date.now }
  },
  {
    versionKey: false
  }
);

const SellerModel: Model<ISellerDocument> = model<ISellerDocument>('Seller', sellerSchema, 'Seller');
export { SellerModel };
