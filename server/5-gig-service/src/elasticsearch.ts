import { Client } from '@elastic/elasticsearch';
import { config } from '@gig/config';
import {
  addIndexedDocument,
  checkElasticSearchConnection,
  createElasticSearchClient,
  createIndexIfMissing,
  deleteIndexedDocument,
  getDocumentCount as getSharedDocumentCount,
  getIndexedDocument,
  ISellerGig,
  updateIndexedDocument,
  winstonLogger
} from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigElasticSearchServer', 'debug');

const elasticSearchClient: Client = createElasticSearchClient(`${config.ELASTIC_SEARCH_URL}`) as Client;

const checkConnection = async (): Promise<void> => {
  await checkElasticSearchConnection({
    client: elasticSearchClient,
    logger: log,
    serviceName: 'GigService',
    errorMessage: 'GigService checkConnection() method:'
  });
};

async function createIndex(indexName: string): Promise<void> {
  await createIndexIfMissing(elasticSearchClient, indexName, {
    logger: log,
    serviceName: 'GigService',
    errorMessage: 'GigService createIndex() method error:'
  });
}

const getDocumentCount = async (index: string): Promise<number> => {
  return getSharedDocumentCount(elasticSearchClient, index, {
    logger: log,
    serviceName: 'GigService',
    errorMessage: 'GigService elasticsearch getDocumentCount() method error:'
  });
};

const getIndexedData = async (index: string, itemId: string): Promise<ISellerGig> => {
  return getIndexedDocument<ISellerGig>(
    elasticSearchClient,
    index,
    itemId,
    {
      logger: log,
      serviceName: 'GigService',
      errorMessage: 'GigService elasticsearch getIndexedData() method error:'
    },
    {} as ISellerGig
  );
};

const addDataToIndex = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  await addIndexedDocument(elasticSearchClient, index, itemId, gigDocument, {
    logger: log,
    serviceName: 'GigService',
    errorMessage: 'GigService elasticsearch addDataToIndex() method error:'
  });
};

const updateIndexedData = async (index: string, itemId: string, gigDocument: unknown): Promise<void> => {
  await updateIndexedDocument(elasticSearchClient, index, itemId, gigDocument, {
    logger: log,
    serviceName: 'GigService',
    errorMessage: 'GigService elasticsearch updateIndexedData() method error:'
  });
};

const deleteIndexedData = async (index: string, itemId: string): Promise<void> => {
  await deleteIndexedDocument(elasticSearchClient, index, itemId, {
    logger: log,
    serviceName: 'GigService',
    errorMessage: 'GigService elasticsearch deleteIndexedData() method error:'
  });
};

export {
  elasticSearchClient,
  checkConnection,
  createIndex,
  getDocumentCount,
  getIndexedData,
  addDataToIndex,
  updateIndexedData,
  deleteIndexedData
};
