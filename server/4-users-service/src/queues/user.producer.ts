import { config } from '@users/config';
import { publishDirectMessage as publishSharedDirectMessage, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@users/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'usersServiceProducer', 'debug');

const publishDirectMessage = async (
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> => {
  await publishSharedDirectMessage({
    channel,
    createConnection,
    exchangeName,
    routingKey,
    message,
    logMessage,
    logger: log,
    errorMessage: 'UsersService publishDirectMessage() method error:'
  });
};

export { publishDirectMessage };
