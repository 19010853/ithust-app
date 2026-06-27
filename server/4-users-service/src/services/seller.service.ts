import { SellerModel } from '@users/models/seller.schema';
import { IOrderMessage, IRatingTypes, IReviewMessageDetails, ISellerDocument } from '@19010853/ithust-shared';
import mongoose from 'mongoose';
import { updateBuyerIsSellerProp } from '@users/services/buyer.service';
import { createOrGetStripeAccount } from '@users/services/stripe-seller.service';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const backfillAvailableBalance = async (seller: ISellerDocument | null): Promise<ISellerDocument | null> => {
  if (!seller || seller.availableBalance !== undefined) {
    return seller;
  }

  const availableBalance = Math.max(Number(seller.totalEarnings || 0) - Number(seller.pendingWithdrawals || 0), 0);
  await SellerModel.updateOne({ _id: seller._id, availableBalance: { $exists: false } }, { $set: { availableBalance } }).exec();
  seller.availableBalance = availableBalance;

  return seller;
};

const getSellerById = async (sellerId: string): Promise<ISellerDocument | null> => {
  const seller: ISellerDocument | null = (await SellerModel.findOne({
    _id: new mongoose.Types.ObjectId(sellerId)
  }).exec()) as ISellerDocument;
  return backfillAvailableBalance(seller);
};

const getSellerByUsername = async (username: string): Promise<ISellerDocument | null> => {
  const seller: ISellerDocument | null = (await SellerModel.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') }).exec()) as ISellerDocument;
  return backfillAvailableBalance(seller);
};

const getSellerByEmail = async (email: string): Promise<ISellerDocument | null> => {
  const seller: ISellerDocument | null = (await SellerModel.findOne({ email }).exec()) as ISellerDocument;
  return seller;
};

const getRandomSellers = async (size: number): Promise<ISellerDocument[]> => {
  const sellers: ISellerDocument[] = await SellerModel.aggregate([{ $sample: { size } }]);
  return sellers;
};

const createSeller = async (sellerData: ISellerDocument): Promise<ISellerDocument> => {
  const createdSeller: ISellerDocument = (await SellerModel.create(sellerData)) as ISellerDocument;
  await updateBuyerIsSellerProp(`${createdSeller.email}`);
  try {
    const stripeSeller = (await createOrGetStripeAccount(`${createdSeller._id}`)) as ISellerDocument;
    return stripeSeller || createdSeller;
  } catch {
    return createdSeller;
  }
};

const updateSeller = async (sellerId: string, sellerData: ISellerDocument): Promise<ISellerDocument> => {
  const updatedSeller: ISellerDocument = (await SellerModel.findOneAndUpdate(
    { _id: sellerId },
    {
      $set: {
        profilePublicId: sellerData.profilePublicId,
        fullName: sellerData.fullName,
        profilePicture: sellerData.profilePicture,
        description: sellerData.description,
        country: sellerData.country,
        skills: sellerData.skills,
        oneliner: sellerData.oneliner,
        languages: sellerData.languages,
        responseTime: sellerData.responseTime,
        experience: sellerData.experience,
        education: sellerData.education,
        socialLinks: sellerData.socialLinks,
        certificates: sellerData.certificates,
        bankAccount: sellerData.bankAccount
      }
    },
    { new: true }
  ).exec()) as ISellerDocument;
  return updatedSeller;
};

const updateTotalGigsCount = async (sellerId: string, count: number): Promise<void> => {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { totalGigs: count } }).exec();
};

const updateSellerOngoingJobsProp = async (sellerId: string, ongoingJobs: number): Promise<void> => {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs } }).exec();
};

const updateSellerCancelledJobsProp = async (sellerId: string): Promise<void> => {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs: -1, cancelledJobs: 1 } }).exec();
};

const updateSellerRefundedOrderProp = async (sellerId: string, ongoingJobs = -1): Promise<void> => {
  await SellerModel.updateOne({ _id: sellerId }, { $inc: { ongoingJobs } }).exec();
};

const updateSellerCompletedJobsProp = async (data: IOrderMessage): Promise<void> => {
  const { sellerId, ongoingJobs, completedJobs, totalEarnings, recentDelivery } = data;
  await SellerModel.updateOne(
    { _id: sellerId },
    {
      $inc: {
        ongoingJobs,
        completedJobs,
        totalEarnings,
        availableBalance: totalEarnings
      },
      $set: { recentDelivery: new Date(recentDelivery!) }
    }
  ).exec();
};

const updateSellerReview = async (data: IReviewMessageDetails): Promise<void> => {
  const ratingTypes: IRatingTypes = {
    '1': 'one',
    '2': 'two',
    '3': 'three',
    '4': 'four',
    '5': 'five'
  };
  const ratingKey: string = ratingTypes[`${data.rating}`];
  await SellerModel.updateOne(
    { _id: data.sellerId },
    {
      $inc: {
        ratingsCount: 1,
        ratingSum: data.rating,
        [`ratingCategories.${ratingKey}.value`]: data.rating,
        [`ratingCategories.${ratingKey}.count`]: 1
      }
    }
  ).exec();
};

export {
  getSellerById,
  getSellerByUsername,
  getSellerByEmail,
  getRandomSellers,
  createSeller,
  updateSeller,
  updateTotalGigsCount,
  updateSellerOngoingJobsProp,
  updateSellerCompletedJobsProp,
  updateSellerReview,
  updateSellerCancelledJobsProp,
  updateSellerRefundedOrderProp
};
