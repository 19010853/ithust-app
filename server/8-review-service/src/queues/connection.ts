import { config } from '@review/config';
import { winstonLogger } from '@19010853/ithust-shared';
import client, { Channel, ChannelModel } from 'amqplib';
import { Logger } from 'winston';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'reviewQueueConnection', 'debug');

async function createConnection(): Promise<Channel | undefined> {
    try {
        const connection: ChannelModel = await client.connect(`${config.RABBITMQ_ENDPOINT}`);
        const channel: Channel = await connection.createChannel();
        log.info('Review server connected to queue successfully...');
        closeConnection(channel, connection);
        return channel;
    } catch (error) {
        log.log('error', 'ReviewService createConnection() method error:', error);
        return undefined;
    }
}

function closeConnection(channel: Channel, connection: ChannelModel): void {
    process.once('SIGINT', async () => {
        await channel.close();
        await connection.close();
    });
}

export { createConnection };