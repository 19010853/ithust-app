import { Client } from '@elastic/elasticsearch';
import { config } from '@review/config';
import { checkElasticSearchConnection, createElasticSearchClient, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewElasticSearchServer', 'debug');

const elasticSearchClient: Client = createElasticSearchClient(`${config.ELASTIC_SEARCH_URL}`) as Client;

const checkConnection = async (): Promise<void> => {
  await checkElasticSearchConnection({
    client: elasticSearchClient,
    logger: log,
    serviceName: 'ReviewService',
    errorMessage: 'ReviewService checkConnection() method:'
  });
};

export { checkConnection };
