import { configureCloudinary, loadEnv, startElasticApm, stripInlineComment } from '@19010853/ithust-shared';

loadEnv();
startElasticApm({ serviceName: 'ithust-order' });

class Config {
  public DATABASE_URL: string | undefined;
  public NODE_ENV: string | undefined;
  public RABBITMQ_ENDPOINT: string | undefined;
  public JWT_TOKEN: string | undefined;
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRET: string | undefined;
  public GATEWAY_JWT_TOKEN: string | undefined;
  public API_GATEWAY_URL: string | undefined;
  public CLIENT_URL: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public STRIPE_SECRET_KEY: string;
  public STRIPE_WEBHOOK_SECRET: string;
  public STRIPE_CURRENCY: string;
  public STRIPE_VND_PER_UNIT: number;
  public DISPUTE_SELLER_RESPONSE_HOURS: number;
  public REFUND_SETTLEMENT_MODE: 'ORIGINAL_SOURCE';

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL || '';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.RABBITMQ_ENDPOINT = process.env.RABBITMQ_ENDPOINT || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '';
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET || '';
    this.GATEWAY_JWT_TOKEN = process.env.GATEWAY_JWT_TOKEN || '';
    this.API_GATEWAY_URL = process.env.API_GATEWAY_URL || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.STRIPE_SECRET_KEY = stripInlineComment(process.env.STRIPE_SECRET_KEY);
    this.STRIPE_WEBHOOK_SECRET = stripInlineComment(process.env.STRIPE_WEBHOOK_SECRET);
    this.STRIPE_CURRENCY = stripInlineComment(process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    this.STRIPE_VND_PER_UNIT = Math.max(Number(process.env.STRIPE_VND_PER_UNIT || 25000), 1);
    this.DISPUTE_SELLER_RESPONSE_HOURS = Math.max(Number(process.env.DISPUTE_SELLER_RESPONSE_HOURS || 48), 1);
    this.REFUND_SETTLEMENT_MODE = 'ORIGINAL_SOURCE';
  }

  public cloudinaryConfig(): void {
    configureCloudinary({
      cloudName: this.CLOUD_NAME,
      apiKey: this.CLOUD_API_KEY,
      apiSecret: this.CLOUD_API_SECRET
    });
  }

  public validateStripeConfig(): void {
    if (!this.STRIPE_SECRET_KEY || !this.STRIPE_WEBHOOK_SECRET) {
      throw new Error('STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are required for Stripe sandbox checkout.');
    }
  }
}

export const config: Config = new Config();
