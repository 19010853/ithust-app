import { winstonLogger } from '@19010853/ithust-shared';
import 'express-async-errors'
import { Logger } from 'winston';
import { config } from '@notifications/config';
import { Application } from 'express';
import http from 'http';
import { healthRoutes } from './routes';
import { checkConnection } from './elasticsearch';
import { createConnection } from './queues/connection';
import { Channel } from 'amqplib';
import { consumeAuthEmailMessages, consumeOrderEmailMessages } from './queues/email.consumer';


const SERVER_PORT = 4001;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
    startServer(app);
    app.use('', healthRoutes)
    startQueues();
    startElasticSearch();
}

async function startQueues(): Promise<void> {
    const emailChannel: Channel = await createConnection() as Channel;
    await consumeAuthEmailMessages(emailChannel);
    await consumeOrderEmailMessages(emailChannel);
}

function startElasticSearch(): void {
    checkConnection();
}

function startServer(app: Application): void {
    try {
        const httpServer: http.Server = new http.Server(app);
        log.info(`Worker with process id of ${process.pid} on notification server has started`);
        httpServer.listen(SERVER_PORT, () => {
            log.info(`Notification server running on port ${SERVER_PORT}`);
        })
    } catch (error) {
        log.log('error', 'NotificationService startServer() method: ', error);
    }
}



