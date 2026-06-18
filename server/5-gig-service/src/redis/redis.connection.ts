import { config } from '@gig/config';
import { connectRedisClient, createRedisConnection, type RedisClient, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'gigRedisConnection', 'debug');
const client: RedisClient = createRedisConnection(`${config.REDIS_HOST}`, log);

const redisConnect = async (): Promise<void> => {
  await connectRedisClient(client, log, 'GigService Redis Connection', 'GigService redisConnect() method error:');
};

export { redisConnect, client };
