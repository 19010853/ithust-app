import { Client } from '@elastic/elasticsearch';
import { config } from '@chat/config';
import { checkElasticSearchConnection, createElasticSearchClient, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'chatElasticSearchServer', 'debug');

const elasticSearchClient: Client = createElasticSearchClient(`${config.ELASTIC_SEARCH_URL}`) as Client;

const checkConnection = async (): Promise<void> => {
  await checkElasticSearchConnection({
    client: elasticSearchClient,
    logger: log,
    serviceName: 'ChatService',
    errorMessage: 'ChatService checkConnection() method:'
  });
};

export { checkConnection };
