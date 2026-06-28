import { gigsSearch } from '@gig/services/search.service';
import { mongoGigsSearch, MongoSearchMode } from '@gig/services/mongo-search.service';
import { IPaginateProps, ISellerGig } from '@19010853/ithust-shared';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { sortBy } from 'lodash';

const esSearch = async (req: Request, res: Response): Promise<void> => {
  const { from, size, type } = req.params;
  const paginate: IPaginateProps = { from, size: parseInt(`${size}`), type };

  const start = Date.now();
  const result = await gigsSearch(
    `${req.query.query}`,
    paginate,
    `${req.query.delivery_time}`,
    parseInt(`${req.query.minprice}`),
    parseInt(`${req.query.maxprice}`)
  );
  const queryTimeMs = Date.now() - start;

  let gigs: ISellerGig[] = result.hits.map((item) => item._source as ISellerGig);
  if (type === 'backward') {
    gigs = sortBy(gigs, ['sortId']);
  }

  res.status(StatusCodes.OK).json({
    message: 'Benchmark ES search results',
    engine: 'elasticsearch',
    total: result.total,
    gigs,
    queryTimeMs
  });
};

const mongoSearch = async (req: Request, res: Response): Promise<void> => {
  const { from, size, type } = req.params;
  const mode = (req.query.mode as MongoSearchMode) || 'text';

  const start = Date.now();
  const result = await mongoGigsSearch(
    `${req.query.query}`,
    parseInt(`${from}`) || 0,
    parseInt(`${size}`),
    type,
    mode,
    `${req.query.delivery_time}`,
    parseInt(`${req.query.minprice}`),
    parseInt(`${req.query.maxprice}`)
  );
  const queryTimeMs = Date.now() - start;

  res.status(StatusCodes.OK).json({
    message: 'Benchmark MongoDB search results',
    engine: `mongodb-${mode}`,
    total: result.total,
    gigs: result.hits,
    queryTimeMs
  });
};

export { esSearch, mongoSearch };
