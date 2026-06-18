import { checkElasticSearchConnection, createElasticSearchClient, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@gateway/config';
import { Client } from '@elastic/elasticsearch';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'apiGatewayElasticConnection', 'debug');

class ElasticSearch {
  private elasticSearchClient: Client;

  constructor() {
    this.elasticSearchClient = createElasticSearchClient(`${config.ELASTIC_SEARCH_URL}`) as Client;
  }

  public async checkConnection(): Promise<void> {
    await checkElasticSearchConnection({
      client: this.elasticSearchClient,
      logger: log,
      serviceName: 'GatewayService',
      connectingMessage: 'GatewayService Connecting to ElasticSearch',
      failureMessage: 'Connection to ElasticSearch failed, Retrying...',
      errorMessage: 'GatewayService checkConnection() method error:'
    });
  }
}

export const elasticSearch: ElasticSearch = new ElasticSearch();
