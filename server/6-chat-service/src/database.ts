import { connectMongooseDatabase, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@chat/config';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatDatabaseServer', 'debug');

const databaseConnection = async (): Promise<void> => {
  await connectMongooseDatabase({
    databaseUrl: `${config.DATABASE_URL}`,
    logger: log,
    successMessage: 'Chat service successfully connected to database.',
    errorMessage: 'ChatService databaseConnection() method error:'
  });
};

export { databaseConnection };
