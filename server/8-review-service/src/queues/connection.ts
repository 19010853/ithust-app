import { config } from '@review/config';
import { createRabbitMQConnection, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  return createRabbitMQConnection({
    rabbitMQEndpoint: `${config.RABBITMQ_ENDPOINT}`,
    logger: log,
    successMessage: 'Review server connected to queue successfully...',
    errorMessage: 'ReviewService createConnection() method error:'
  });
}

export { createConnection };
