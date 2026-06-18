import { Client } from '@elastic/elasticsearch';
import { config } from '@auth/config';
import {
  checkElasticSearchConnection,
  createElasticSearchClient,
  createIndexIfMissing,
  getIndexedDocument,
  ISellerGig,
  winstonLogger
} from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'authElasticSearchServer', 'debug');

const elasticSearchClient: Client = createElasticSearchClient(`${config.ELASTIC_SEARCH_URL}`) as Client;

async function checkConnection(): Promise<void> {
  await checkElasticSearchConnection({
    client: elasticSearchClient,
    logger: log,
    serviceName: 'AuthService',
    connectingMessage: 'AuthService connecting to ElasticSearch...',
    errorMessage: 'AuthService checkConnection() method:'
  });
}

async function createIndex(indexName: string): Promise<void> {
  await createIndexIfMissing(elasticSearchClient, indexName, {
    logger: log,
    serviceName: 'AuthService',
    errorMessage: 'AuthService createIndex() method error:'
  });
}

async function getDocumentById(index: string, gigId: string): Promise<ISellerGig> {
  return getIndexedDocument<ISellerGig>(
    elasticSearchClient,
    index,
    gigId,
    {
      logger: log,
      serviceName: 'AuthService',
      errorMessage: 'AuthService elastcisearch getDocumentById() method error:'
    },
    {} as ISellerGig
  );
}

export { elasticSearchClient, checkConnection, createIndex, getDocumentById };
