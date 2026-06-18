import { connectMongooseDatabase, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@gig/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  await connectMongooseDatabase({
    databaseUrl: `${config.DATABASE_URL}`,
    logger: log,
    successMessage: 'Gig service successfully connected to database.',
    errorMessage: 'GigService databaseConnection() method error:'
  });
};

export { databaseConnection };
