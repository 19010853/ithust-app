import { connectMongooseDatabase, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@users/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  await connectMongooseDatabase({
    databaseUrl: `${config.DATABASE_URL}`,
    logger: log,
    successMessage: 'Users service successfully connected to database.',
    errorMessage: 'UsersService databaseConnection() method error:'
  });
};

export { databaseConnection };
