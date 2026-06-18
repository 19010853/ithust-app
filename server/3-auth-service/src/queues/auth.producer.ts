import { config } from '@auth/config';
import { publishDirectMessage as publishSharedDirectMessage, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@auth/queues/connection';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authServiceProducer', 'debug');

export async function publishDirectMessage(
  channel: Channel,
  exchangeName: string,
  routingKey: string,
  message: string,
  logMessage: string
): Promise<void> {
  await publishSharedDirectMessage({
    channel,
    createConnection,
    exchangeName,
    routingKey,
    message,
    logMessage,
    logger: log,
    errorMessage: 'AuthService Provider publishDirectMessage() method error:'
  });
}
