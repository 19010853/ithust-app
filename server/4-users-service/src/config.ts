import { configureCloudinary, loadEnv, startElasticApm } from '@19010853/ithust-shared';

loadEnv();
startElasticApm({ serviceName: 'ithust-users' });

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
  public REDIS_HOST: string | undefined;
  public ELASTIC_SEARCH_URL: string | undefined;
  public PLATFORM_OWNER_EMAIL: string | undefined;
  public CLIENT_URL: string | undefined;
  public STRIPE_SECRET_KEY: string;
  public STRIPE_CONNECT_WEBHOOK_SECRET: string;
  public STRIPE_CONNECT_RETURN_URL: string;
  public STRIPE_CONNECT_REFRESH_URL: string;
  public STRIPE_CURRENCY: string;
  public STRIPE_AUTOMATIC_PAYOUT_ENABLED: boolean;
  public PAYOUT_MIN_AMOUNT: number;
  public PAYOUT_MAX_AMOUNT_PER_REQUEST: number;

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
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.ELASTIC_SEARCH_URL = process.env.ELASTIC_SEARCH_URL || '';
    this.PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || '';
    this.CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';
    this.STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
    this.STRIPE_CONNECT_WEBHOOK_SECRET = process.env.STRIPE_CONNECT_WEBHOOK_SECRET || '';
    this.STRIPE_CONNECT_RETURN_URL = process.env.STRIPE_CONNECT_RETURN_URL || `${this.CLIENT_URL}/seller/stripe/return`;
    this.STRIPE_CONNECT_REFRESH_URL = process.env.STRIPE_CONNECT_REFRESH_URL || `${this.CLIENT_URL}/seller/stripe/refresh`;
    this.STRIPE_CURRENCY = (process.env.STRIPE_CURRENCY || 'usd').toLowerCase();
    this.STRIPE_AUTOMATIC_PAYOUT_ENABLED = process.env.STRIPE_AUTOMATIC_PAYOUT_ENABLED !== 'false';
    this.PAYOUT_MIN_AMOUNT = Math.max(Number(process.env.PAYOUT_MIN_AMOUNT || 100000), 1);
    this.PAYOUT_MAX_AMOUNT_PER_REQUEST = Math.max(Number(process.env.PAYOUT_MAX_AMOUNT_PER_REQUEST || 20000000), this.PAYOUT_MIN_AMOUNT);
  }

  public cloudinaryConfig(): void {
    configureCloudinary({
      cloudName: this.CLOUD_NAME,
      apiKey: this.CLOUD_API_KEY,
      apiSecret: this.CLOUD_API_SECRET
    });
  }

  public validateStripeConfig(): void {
    if (!this.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required for Stripe Connect sandbox payouts.');
    }
    if (!this.STRIPE_CONNECT_WEBHOOK_SECRET) {
      throw new Error('STRIPE_CONNECT_WEBHOOK_SECRET is required for Stripe Connect payout webhooks.');
    }
  }
}

export const config: Config = new Config();
