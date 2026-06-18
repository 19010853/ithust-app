import { config } from '@order/config';
import { createRabbitMQConnection, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'orderQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  return createRabbitMQConnection({
    rabbitMQEndpoint: `${config.RABBITMQ_ENDPOINT}`,
    logger: log,
    successMessage: 'Order server connected to queue successfully...',
    errorMessage: 'OrderService createConnection() method error:'
  });
}

export { createConnection };
