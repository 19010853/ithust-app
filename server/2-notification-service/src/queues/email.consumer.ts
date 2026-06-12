import { IEmailLocals, winstonLogger } from '@19010853/ithust-shared';
import { config } from '@notifications/config';
import { Channel, ConsumeMessage } from 'amqplib';
import { Logger } from 'winston';
import { createConnection } from '@notifications/queues/connection';
import { sendEmail } from '@notifications/queues/mail.transport';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'notificationQueueConnection', 'debug');

interface IAuthEmailMessage {
  receiverEmail: string;
  resetLink?: string;
  template: string;
  username?: string;
  verifyLink?: string;
  otp?: string;
}

async function consumeAuthEmailMessages(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'ithust-email-notification';
    const routingKey = 'auth-email';
    const queueName = 'auth-email-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const jobQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobQueue.queue, exchangeName, routingKey);
    channel.consume(jobQueue.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        return;
      }

      let receiverEmail = '';
      let template = '';

      try {
        const parsedMessage = JSON.parse(msg.content.toString()) as IAuthEmailMessage;
        const { username, verifyLink, resetLink, otp } = parsedMessage;
        receiverEmail = parsedMessage.receiverEmail;
        template = parsedMessage.template;
        const locals: IEmailLocals = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          verifyLink,
          resetLink,
          otp
        };
        await sendEmail(template, receiverEmail, locals);
        channel.ack(msg);
      } catch (error) {
        log.log(
          'error',
          `NotificationService EmailConsumer auth email failed for template "${template}" and receiver "${receiverEmail}". Message will not be requeued:`,
          error
        );
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeAuthMessages() method error:', error);
  }
}

async function consumeOrderEmailMessages(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'ithust-order-notification';
    const routingKey = 'order-email';
    const queueName = 'order-email-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const jobQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobQueue.queue, exchangeName, routingKey);
    channel.consume(jobQueue.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        return;
      }

      let receiverEmail = '';
      let template = '';

      try {
        const parsedMessage = JSON.parse(msg.content.toString());
        const {
          username,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total,
          buyerEmail,
          bankName,
          accountNumber,
          accountName,
          refundRequestId
        } = parsedMessage;
        receiverEmail = parsedMessage.receiverEmail;
        template = parsedMessage.template;
        const locals: IEmailLocals & Record<string, unknown> = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username,
          sender,
          offerLink,
          amount,
          buyerUsername,
          sellerUsername,
          title,
          description,
          deliveryDays,
          orderId,
          orderDue,
          requirements,
          orderUrl,
          originalDate,
          newDate,
          reason,
          subject,
          header,
          type,
          message,
          serviceFee,
          total,
          buyerEmail,
          bankName,
          accountNumber,
          accountName,
          refundRequestId
        };
        if (template === 'orderPlaced') {
          await sendEmail('orderPlaced', receiverEmail, locals);
          await sendEmail('orderReceipt', receiverEmail, locals);
        } else {
          await sendEmail(template, receiverEmail, locals);
        }
        channel.ack(msg);
      } catch (error) {
        log.log(
          'error',
          `NotificationService EmailConsumer order email failed for template "${template}" and receiver "${receiverEmail}". Message will not be requeued:`,
          error
        );
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeOrderEmailMessages() method error:', error);
  }
}

async function consumeWithdrawalEmailMessages(channel: Channel): Promise<void> {
  try {
    if (!channel) {
      channel = (await createConnection()) as Channel;
    }
    const exchangeName = 'ithust-withdrawal-notification';
    const routingKey = 'withdrawal-email';
    const queueName = 'withdrawal-email-queue';
    await channel.assertExchange(exchangeName, 'direct');
    const jobQueue = await channel.assertQueue(queueName, { durable: true, autoDelete: false });
    await channel.bindQueue(jobQueue.queue, exchangeName, routingKey);
    channel.consume(jobQueue.queue, async (msg: ConsumeMessage | null) => {
      if (!msg) {
        return;
      }

      let receiverEmail = '';
      let template = '';

      try {
        const parsedMessage = JSON.parse(msg.content.toString());
        const {
          sellerUsername,
          sellerFullName,
          amount,
          bankName,
          accountNumber,
          accountName,
          withdrawalId,
          requestDate,
          status,
          processedDate,
          adminNote,
          paymentReference
        } = parsedMessage;
        receiverEmail = parsedMessage.receiverEmail;
        template = parsedMessage.template;
        const locals: IEmailLocals & Record<string, unknown> = {
          appLink: `${config.CLIENT_URL}`,
          appIcon: 'https://i.ibb.co/Kyp2m0t/cover.png',
          username: sellerUsername,
          sellerUsername,
          sellerFullName,
          amount,
          bankName,
          accountNumber,
          accountName,
          withdrawalId,
          requestDate,
          status,
          processedDate,
          adminNote,
          paymentReference
        };
        await sendEmail(template, receiverEmail, locals);
        channel.ack(msg);
      } catch (error) {
        log.log(
          'error',
          `NotificationService EmailConsumer withdrawal email failed for template "${template}" and receiver "${receiverEmail}". Message will not be requeued:`,
          error
        );
        channel.nack(msg, false, false);
      }
    });
  } catch (error) {
    log.log('error', 'NotificationService EmailConsumer consumeWithdrawalEmailMessages() method error:', error);
  }
}

export { consumeAuthEmailMessages, consumeOrderEmailMessages, consumeWithdrawalEmailMessages };
