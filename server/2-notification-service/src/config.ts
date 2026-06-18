import { loadEnv } from '@19010853/ithust-shared';

loadEnv();

class Config {
  public NODE_ENV: string | undefined;
  public CLIENT_URL: string | undefined;
  public SMTP_HOST: string | undefined;
  public SMTP_PORT: string | undefined;
  public SMTP_SECURE: string | undefined;
  public SMTP_USERNAME: string | undefined;
  public SMTP_PASSWORD: string | undefined;
  public SENDER_NAME: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || '';
    const isProduction = this.NODE_ENV === 'production';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.SMTP_HOST = isProduction ? process.env.SMTP_HOST || 'smtp-relay.brevo.com' : 'smtp.ethereal.email';
    this.SMTP_PORT = process.env.SMTP_PORT || '587';
    this.SMTP_SECURE = process.env.SMTP_SECURE || 'false';
    this.SMTP_USERNAME = process.env.SMTP_USERNAME || '';
    this.SMTP_PASSWORD = process.env.SMTP_PASSWORD || '';
    this.SENDER_NAME = process.env.SENDER_NAME || 'ITHust App';
    this.SENDER_EMAIL = this.resolveSenderEmail(process.env.SENDER_EMAIL, this.SMTP_USERNAME);
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
  }

  private resolveSenderEmail(senderEmail: string | undefined, smtpUsername: string | undefined): string {
    if (!senderEmail || senderEmail === 'REPLACE_WITH_ETHEREAL_SMTP_USER') {
      return smtpUsername || '';
    }

    return senderEmail;
  }
}

export const config: Config = new Config();
