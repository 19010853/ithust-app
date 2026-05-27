import path from 'path';
import { IEmailLocals, winstonLogger } from '@19010853/ithust-shared';
import { Logger } from 'winston';
import { config } from '@notifications/config';
import nodemailer, { SentMessageInfo, Transporter } from 'nodemailer';
import Email from 'email-templates';

const log: Logger = winstonLogger(`${config.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');

async function emailTemplates(template: string, receiver: string, locals: IEmailLocals): Promise<void> {
  try {
    const smtpTransport: Transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: config.SENDER_EMAIL,
        pass: config.SENDER_EMAIL_PASSWORD
      }
    });
    const email: Email = new Email({
      message: {
        from: `ITHust App <${config.SENDER_EMAIL}>`
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true,
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.join(__dirname, '../build')
        }
      }
    });

    const info: SentMessageInfo = await email.send({
      template: path.join(__dirname, '..', 'src/emails', template),
      message: { to: receiver },
      locals
    });
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      log.info(`Email preview URL for ${receiver}: ${previewUrl}`);
    }
  } catch (error) {
    log.log('error', `NotificationService emailTemplates() failed for template ${template} and receiver ${receiver}:`, error);
    throw error;
  }
}

export { emailTemplates };
