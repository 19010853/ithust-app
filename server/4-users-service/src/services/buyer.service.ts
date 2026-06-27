import { BuyerModel } from '@users/models/buyer.schema';
import { IAuthPayload, IBuyerDocument } from '@19010853/ithust-shared';

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const FALLBACK_PROFILE_PICTURE = 'https://placehold.co/150x150?text=Anh+dai+dien';

const getBuyerByEmail = async (email: string): Promise<IBuyerDocument | null> => {
  const buyer: IBuyerDocument | null = (await BuyerModel.findOne({ email }).exec()) as IBuyerDocument;
  return buyer;
};

const getBuyerByUsername = async (username: string): Promise<IBuyerDocument | null> => {
  const buyer: IBuyerDocument | null = (await BuyerModel.findOne({ username: new RegExp(`^${escapeRegex(username)}$`, 'i') }).exec()) as IBuyerDocument;
  return buyer;
};

const getOrCreateBuyerByAuth = async (currentUser: IAuthPayload): Promise<IBuyerDocument | null> => {
  if (!currentUser?.username || !currentUser?.email) {
    return null;
  }

  const existingBuyer = (await getBuyerByUsername(currentUser.username)) || (await getBuyerByEmail(currentUser.email));
  if (existingBuyer) {
    return existingBuyer;
  }

  return (await BuyerModel.create({
    username: currentUser.username,
    email: currentUser.email,
    profilePicture: FALLBACK_PROFILE_PICTURE,
    country: 'Vietnam',
    accountStatus: 'ACTIVE',
    isSeller: false,
    purchasedGigs: [],
    createdAt: new Date()
  })) as IBuyerDocument;
};

const getRandomBuyers = async (count: number): Promise<IBuyerDocument[]> => {
  const buyers: IBuyerDocument[] = await BuyerModel.aggregate([{ $sample: { size: count } }]);
  return buyers;
};

const createBuyer = async (buyerData: IBuyerDocument): Promise<void> => {
  const checkIfBuyerExist: IBuyerDocument | null = await getBuyerByEmail(`${buyerData.email}`);
  if (!checkIfBuyerExist) {
    await BuyerModel.create(buyerData);
  }
};

const updateBuyerIsSellerProp = async (email: string): Promise<void> => {
  await BuyerModel.updateOne(
    { email },
    {
      $set: {
        isSeller: true
      }
    }
  ).exec();
};

const updateBuyerPurchasedGigsProp = async (buyerId: string, purchasedGigId: string, type: string): Promise<void> => {
  await BuyerModel.updateOne(
    { _id: buyerId },
    type === 'purchased-gigs'
      ? {
          $push: {
            purchasedGigs: purchasedGigId
          }
        }
      : {
          $pull: {
            purchasedGigs: purchasedGigId
          }
        }
  ).exec();
};

export {
  getBuyerByEmail,
  getBuyerByUsername,
  getOrCreateBuyerByAuth,
  getRandomBuyers,
  createBuyer,
  updateBuyerIsSellerProp,
  updateBuyerPurchasedGigsProp
};
