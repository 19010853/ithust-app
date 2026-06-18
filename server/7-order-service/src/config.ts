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
  public PLATFORM_BANK_ID: string | undefined;
  public PLATFORM_BANK_ACCOUNT: string | undefined;
  public SEPAY_MODE: string | undefined;

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
    this.PLATFORM_BANK_ID = stripInlineComment(process.env.PLATFORM_BANK_ID);
    this.PLATFORM_BANK_ACCOUNT = stripInlineComment(process.env.PLATFORM_BANK_ACCOUNT);
    this.SEPAY_MODE = stripInlineComment(process.env.SEPAY_MODE || 'test').toLowerCase();
  }

  public cloudinaryConfig(): void {
    configureCloudinary({
      cloudName: this.CLOUD_NAME,
      apiKey: this.CLOUD_API_KEY,
      apiSecret: this.CLOUD_API_SECRET
    });
  }

  public getSepayMode(): 'test' | 'live' {
    return this.SEPAY_MODE === 'live' ? 'live' : 'test';
  }
}

export const config: Config = new Config();
