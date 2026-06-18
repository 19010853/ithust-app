import { Client } from '@elastic/elasticsearch';
import { config } from '@notifications/config';
import { checkElasticSearchConnection, createElasticSearchClient, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationElasticSearchServer', 'debug');

const elasticSearchClient: Client = createElasticSearchClient(`${config.ELASTIC_SEARCH_URL}`) as Client;

export async function checkConnection(): Promise<void> {
  await checkElasticSearchConnection({
    client: elasticSearchClient,
    logger: log,
    serviceName: 'NotificationService',
    errorMessage: 'NotificationService checkConnection() method:'
  });
}
