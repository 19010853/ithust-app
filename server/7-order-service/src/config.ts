import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config({});

if (process.env.ENABLE_APM === '1') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('elastic-apm-node').start({
    serviceName: 'ithust-order',
    serverUrl: process.env.ELASTIC_APM_SERVER_URL,
    secretToken: process.env.ELASTIC_APM_SECRET_TOKEN,
    environment: process.env.NODE_ENV,
    active: true,
    captureBody: 'all',
    errorOnAbortedRequests: true,
    captureErrorLogStackTraces: 'always'
  });
}

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
  public PLATFORM_BANK_ID: string | undefined;
  public PLATFORM_BANK_ACCOUNT: string | undefined;
  public SEPAY_MODE: string | undefined;
  public USD_TO_VND_RATE_API_URL: string | undefined;
  public USD_TO_VND_RATE_FALLBACK: string | undefined;

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
    
    // Safely parse SePay variables in case they still contain trailing comments in memory
    this.PLATFORM_BANK_ID = (process.env.PLATFORM_BANK_ID || '').split('#')[0].trim();
    this.PLATFORM_BANK_ACCOUNT = (process.env.PLATFORM_BANK_ACCOUNT || '').split('#')[0].trim();
    this.SEPAY_MODE = (process.env.SEPAY_MODE || 'test').split('#')[0].trim().toLowerCase();
    this.USD_TO_VND_RATE_API_URL = (process.env.USD_TO_VND_RATE_API_URL || '').split('#')[0].trim();
    this.USD_TO_VND_RATE_FALLBACK = (process.env.USD_TO_VND_RATE_FALLBACK || '').split('#')[0].trim();
  }

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET
    });
  }

  public getUsdToVndRateFallback(): number {
    const rate: number = Number(this.USD_TO_VND_RATE_FALLBACK);
    if (!Number.isFinite(rate) || rate <= 0) {
      throw new Error('USD_TO_VND_RATE_FALLBACK must be configured as a positive number.');
    }
    return rate;
  }

  public getSepayMode(): 'test' | 'live' {
    return this.SEPAY_MODE === 'live' ? 'live' : 'test';
  }
}

export const config: Config = new Config();
