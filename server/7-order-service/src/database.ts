import { connectMongooseDatabase, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@order/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  await connectMongooseDatabase({
    databaseUrl: `${config.DATABASE_URL}`,
    logger: log,
    successMessage: 'Order service successfully connected to database.',
    errorMessage: 'OrderService databaseConnection() method error:'
  });
};

export { databaseConnection };
