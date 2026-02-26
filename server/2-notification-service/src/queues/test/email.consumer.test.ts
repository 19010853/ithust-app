import * as connection from '@notifications/queues/connection';
import amqb from 'amqplib';

import { consumeAuthEmailMessages, consumeOrderEmailMessages } from '@notifications/queues/email.consumer';

jest.mock('amqplib');
jest.mock('@notifications/queues/connection');
jest.mock('@19010853/ithust-shared');

describe('Email Consumer', () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('consumeAuthEmailMessages test', () => {
        it('should consume auth email messages', async () => {
            const channel = {
                assertExchange: jest.fn(),
                assertQueue: jest.fn(),
                publish: jest.fn(),
                bindQueue: jest.fn(),
                consume: jest.fn(),
            };
            jest.spyOn(channel, 'assertExchange');
            jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: 'auth-email-queue', messageCount: 0, consumerCount: 0 });
            jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);

            const connectionChannel: amqb.Channel | undefined = await connection.createConnection() as amqb.Channel;
            await consumeAuthEmailMessages(connectionChannel as amqb.Channel);
            expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('ithust-email-notification', 'direct');
            expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
            expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
            expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('auth-email-queue', 'ithust-email-notification', 'auth-email');
        });
    });

    describe('consumeOrderEmailMessages test', () => {
        it('should consume order email messages', async () => {
            const channel = {
                assertExchange: jest.fn(),
                assertQueue: jest.fn(),
                publish: jest.fn(),
                bindQueue: jest.fn(),
                consume: jest.fn(),
            };
            jest.spyOn(channel, 'assertExchange');
            jest.spyOn(channel, 'assertQueue').mockReturnValue({ queue: 'order-email-queue', messageCount: 0, consumerCount: 0 });
            jest.spyOn(connection, 'createConnection').mockReturnValue(channel as never);
            const connectionChannel: amqb.Channel | undefined = await connection.createConnection() as amqb.Channel;
            await consumeOrderEmailMessages(connectionChannel as amqb.Channel);
            expect(connectionChannel!.assertExchange).toHaveBeenCalledWith('ithust-order-notification', 'direct');
            expect(connectionChannel!.assertQueue).toHaveBeenCalledTimes(1);
            expect(connectionChannel!.consume).toHaveBeenCalledTimes(1);
            expect(connectionChannel!.bindQueue).toHaveBeenCalledWith('order-email-queue', 'ithust-order-notification', 'order-email');
        });
    });
});