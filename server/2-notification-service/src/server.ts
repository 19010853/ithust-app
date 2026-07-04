import http from 'http';

import { winstonLogger } from '@19010853/ithust-shared';
import { config } from '@notifications/config';
import { checkConnection } from '@notifications/elasticsearch';
import { consumeAuthEmailMessages, consumeOrderEmailMessages, consumeWithdrawalEmailMessages } from '@notifications/queues/email.consumer';
import { createConnection } from '@notifications/queues/connection';
import { healthRoutes } from '@notifications/routes';
import { Channel } from 'amqplib';
import { Application } from 'express';
import 'express-async-errors';
import { Logger } from 'winston';

const SERVER_PORT = 4001;

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationServer', 'debug');

export function start(app: Application): void {
  startServer(app);
  app.use('', healthRoutes());
  startQueues();
  startElasticSearch();
}

async function startQueues(): Promise<void> {
  const emailChannel: Channel = (await createConnection()) as Channel;
  await consumeAuthEmailMessages(emailChannel);
  await consumeOrderEmailMessages(emailChannel);
  await consumeWithdrawalEmailMessages(emailChannel);
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
    });
  } catch (error) {
    log.log('error', 'NotificationService startServer() method: ', error);
  }
}
