import { ISellerGig } from '@19010853/ithust-shared';
import { GigModel } from '@gig/models/gig.schema';
import { FilterQuery } from 'mongoose';

export interface IMongoSearchResult {
  total: number;
  hits: ISellerGig[];
}

export type MongoSearchMode = 'text' | 'regex';

const mongoGigsSearch = async (
  searchQuery: string,
  from: number,
  size: number,
  type: string,
  mode: MongoSearchMode = 'text',
  deliveryTime?: string,
  min?: number,
  max?: number
): Promise<IMongoSearchResult> => {
  const filter: FilterQuery<ISellerGig> = { active: true };

  if (mode === 'text') {
    filter['$text'] = { $search: searchQuery };
  } else {
    const regex = new RegExp(searchQuery, 'i');
    filter['$or'] = [
      { username: regex },
      { title: regex },
      { description: regex },
      { basicDescription: regex },
      { basicTitle: regex },
      { categories: regex },
      { subCategories: regex },
      { tags: regex }
    ];
  }

  if (deliveryTime && deliveryTime !== 'undefined') {
    filter['expectedDelivery'] = new RegExp(deliveryTime, 'i');
  }

  if (!isNaN(min as number) && !isNaN(max as number) && min !== undefined && max !== undefined) {
    filter['price'] = { $gte: min, $lte: max };
  }

  const sortOrder = type === 'forward' ? 1 : -1;
  const [docs, total] = await Promise.all([
    GigModel.find(filter)
      .sort({ sortId: sortOrder })
      .skip(from)
      .limit(size)
      .lean(),
    GigModel.countDocuments(filter)
  ]);

  return { total, hits: docs as ISellerGig[] };
};

const mongoGigsSearchByCategory = async (searchQuery: string): Promise<IMongoSearchResult> => {
  const [docs, total] = await Promise.all([
    GigModel.find({ categories: new RegExp(searchQuery, 'i'), active: true }).limit(10).lean(),
    GigModel.countDocuments({ categories: new RegExp(searchQuery, 'i'), active: true })
  ]);
  return { total, hits: docs as ISellerGig[] };
};

const mongoGetTopRatedGigsByCategory = async (searchQuery: string): Promise<IMongoSearchResult> => {
  const [docs, total] = await Promise.all([
    GigModel.find({
      categories: new RegExp(searchQuery, 'i'),
      active: true,
      ratingsCount: { $gt: 0 },
      $expr: { $eq: [{ $divide: ['$ratingSum', '$ratingsCount'] }, 5] }
    })
      .limit(10)
      .lean(),
    GigModel.countDocuments({
      categories: new RegExp(searchQuery, 'i'),
      active: true,
      ratingsCount: { $gt: 0 },
      $expr: { $eq: [{ $divide: ['$ratingSum', '$ratingsCount'] }, 5] }
    })
  ]);
  return { total, hits: docs as ISellerGig[] };
};

export { mongoGigsSearch, mongoGigsSearchByCategory, mongoGetTopRatedGigsByCategory };
