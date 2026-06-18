import { config } from '@gig/config';
import { createRabbitMQConnection, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  return createRabbitMQConnection({
    rabbitMQEndpoint: `${config.RABBITMQ_ENDPOINT}`,
    logger: log,
    successMessage: 'Gig server connected to queue successfully...',
    errorMessage: 'GigService createConnection() method error:'
  });
}

export { createConnection };
