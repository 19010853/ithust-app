import Stripe from 'stripe';
import { BadRequestError } from '@19010853/ithust-shared';
import { SellerModel } from '@users/models/seller.schema';
import {
  createAccountLink,
  createExpressAccount,
  evaluateStripePayoutReadiness,
  IStripePayoutReadiness,
  retrieveAccount
} from '@users/services/stripe-connect.service';

type SellerStripeDocument = {
  _id?: string;
  email?: string;
  stripeAccountId?: string;
};

const stripeReadinessUpdate = (readiness: IStripePayoutReadiness): Record<string, unknown> => ({
  stripeOnboardingStatus: readiness.onboardingStatus,
  stripePayoutReadiness: readiness.payoutReadiness,
  payoutsEnabled: readiness.payoutsEnabled,
  chargesEnabled: readiness.chargesEnabled,
  stripeDetailsSubmitted: readiness.detailsSubmitted,
  stripeExternalAccountReady: readiness.externalAccountReady,
  stripeRequirementsCurrentlyDue: readiness.currentlyDue,
  stripeRequirementsPastDue: readiness.pastDue,
  stripeRequirementsDisabledReason: readiness.disabledReason
});

const persistStripeAccountStatus = async (sellerId: string, account: Stripe.Account): Promise<any> => {
  const readiness = evaluateStripePayoutReadiness(account);
  return SellerModel.findOneAndUpdate(
    { _id: sellerId },
    {
      $set: {
        stripeAccountId: account.id,
        ...stripeReadinessUpdate(readiness)
      }
    },
    { new: true }
  ).exec();
};

export const createOrGetStripeAccount = async (sellerId: string): Promise<any> => {
  const seller = (await SellerModel.findById(sellerId).exec()) as SellerStripeDocument | null;
  if (!seller) throw new BadRequestError('Seller not found.', 'createOrGetStripeAccount()');

  if (!seller.stripeAccountId) {
    const account = await createExpressAccount(`${seller.email || ''}`);
    const readiness = evaluateStripePayoutReadiness(account);
    await SellerModel.updateOne(
      { _id: sellerId },
      {
        $set: {
          stripeAccountId: account.id,
          ...stripeReadinessUpdate(readiness)
        }
      }
    ).exec();
    return SellerModel.findById(sellerId).exec();
  }

  return refreshStripeAccountStatus(sellerId);
};

export const createStripeAccountLink = async (sellerId: string): Promise<{ url: string; seller: any }> => {
  const seller = (await createOrGetStripeAccount(sellerId)) as SellerStripeDocument;
  const link = await createAccountLink(`${seller.stripeAccountId}`, sellerId);
  return { url: link.url, seller };
};

export const refreshStripeAccountStatus = async (sellerId: string): Promise<any> => {
  const seller = (await SellerModel.findById(sellerId).exec()) as SellerStripeDocument | null;
  if (!seller) throw new BadRequestError('Seller not found.', 'refreshStripeAccountStatus()');
  if (!seller.stripeAccountId) return seller;

  const account = await retrieveAccount(`${seller.stripeAccountId}`);
  return persistStripeAccountStatus(sellerId, account);
};

export const refreshStripeAccountStatusByAccountId = async (stripeAccountId: string): Promise<any> => {
  const seller = (await SellerModel.findOne({ stripeAccountId }).exec()) as SellerStripeDocument | null;
  if (!seller?._id) {
    return null;
  }
  const account = await retrieveAccount(stripeAccountId);
  return persistStripeAccountStatus(`${seller._id}`, account);
};

export const refreshStripeAccountStatusFromEventAccount = async (account: Stripe.Account): Promise<any> => {
  const seller = await SellerModel.findOne({ stripeAccountId: account.id }).exec();
  if (!seller?._id) {
    return null;
  }
  return persistStripeAccountStatus(`${seller._id}`, account);
};
