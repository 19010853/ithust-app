import { config } from '@gateway/config';
import { connectRedisClient, createRedisConnection, type RedisClient, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gatewayRedisConnection', 'debug');

class RedisConnection {
  client: RedisClient;

  constructor() {
    this.client = createRedisConnection(`${config.REDIS_HOST}`, log);
  }

  async redisConnect(): Promise<void> {
    await connectRedisClient(this.client, log, 'GatewayService Redis Connection', 'GatewayService redisConnect() method error:');
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
