import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@order/queues/connection';
import { config } from '@order/config';
import { publishDirectMessage as publishSharedDirectMessage, winstonLogger } from '@19010853/ithust-shared';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderServiceProducer', 'debug');

export const publishDirectMessage = async (
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
    errorMessage: 'OrderService OrderServiceProducer publishDirectMessage() method:'
  });
};
