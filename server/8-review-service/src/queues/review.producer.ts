import { Channel } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@review/queues/connection';
import { config } from '@review/config';
import { publishFanoutMessage as publishSharedFanoutMessage, winstonLogger } from '@19010853/ithust-shared';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewServiceProducer', 'debug');

export const publishFanoutMessage = async (channel: Channel, exchangeName: string, message: string, logMessage: string): Promise<void> => {
  await publishSharedFanoutMessage({
    channel,
    createConnection,
    exchangeName,
    message,
    logMessage,
    logger: log,
    errorMessage: 'ReviewService publishFanoutMessage() method:'
  });
};
