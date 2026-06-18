import { config } from '@notifications/config';
import { createRabbitMQConnection, winstonLogger } from '@19010853/ithust-shared';
import { Channel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
  return createRabbitMQConnection({
    rabbitMQEndpoint: `${config.RABBITMQ_ENDPOINT}`,
    logger: log,
    successMessage: 'Notification server connected to queue successfully...',
    errorMessage: 'NotificationService error createConnection() method:'
  });
}

export { createConnection };
