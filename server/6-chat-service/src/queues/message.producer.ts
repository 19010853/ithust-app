import { config } from '@chat/config';
import { publishDirectMessage as publishSharedDirectMessage, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@chat/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatServiceProducer', 'debug');

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
    errorMessage: 'ChatService publishDirectMessage() method error:'
  });
};

export { publishDirectMessage };
