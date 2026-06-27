import * as https from 'https';
import { config } from '@order/config';

export interface ExchangeRateSnapshot {
  vndPerUnit: number;
  source: string;
  fetchedAt: Date;
}

export interface ProviderAmount {
  value: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource: string;
  exchangeRateFetchedAt: Date;
}

// Stripe zero-decimal currencies: amount IS the major unit (e.g. 100 JPY = 100, not 10000)
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
]);

const isZeroDecimalCurrency = (currency: string): boolean =>
  ZERO_DECIMAL_CURRENCIES.has(currency.toLowerCase());

interface RateCache {
  vndPerUnit: number;
  currency: string;
  cachedAt: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
let cache: RateCache | undefined;

const CDN_PRIMARY = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/vnd.json';
const CDN_FALLBACK = 'https://latest.currency-api.pages.dev/v1/currencies/vnd.json';

const fetchJson = (url: string): Promise<unknown> =>
  new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        try {
          resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (e) {
          reject(e);
        }
      });
      res.on('error', reject);
    });
    req.setTimeout(5000, () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });

const tryFetchRate = async (url: string, currency: string): Promise<number | null> => {
  try {
    const data = (await fetchJson(url)) as { vnd?: Record<string, number> };
    const rate = data?.vnd?.[currency.toLowerCase()];
    return rate && rate > 0 ? 1 / rate : null;
  } catch {
    return null;
  }
};

export const getVndPerStripeUnit = async (): Promise<ExchangeRateSnapshot> => {
  const currency = config.STRIPE_CURRENCY;

  if (cache && cache.currency === currency && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return { vndPerUnit: cache.vndPerUnit, source: 'cache', fetchedAt: new Date(cache.cachedAt) };
  }

  const fromPrimary = await tryFetchRate(CDN_PRIMARY, currency);
  if (fromPrimary) {
    cache = { vndPerUnit: fromPrimary, currency, cachedAt: Date.now() };
    return { vndPerUnit: fromPrimary, source: 'api:fawazahmed0', fetchedAt: new Date() };
  }

  const fromFallback = await tryFetchRate(CDN_FALLBACK, currency);
  if (fromFallback) {
    cache = { vndPerUnit: fromFallback, currency, cachedAt: Date.now() };
    return { vndPerUnit: fromFallback, source: 'api:fawazahmed0-fallback', fetchedAt: new Date() };
  }

  return { vndPerUnit: config.STRIPE_VND_PER_UNIT, source: 'fallback:STRIPE_VND_PER_UNIT', fetchedAt: new Date() };
};

export const toStripeAmountFromVnd = async (amountVnd: number): Promise<ProviderAmount & { amountInSmallestUnit: number }> => {
  const currency = config.STRIPE_CURRENCY;
  const snapshot = await getVndPerStripeUnit();
  const valueInCurrency = amountVnd / snapshot.vndPerUnit;
  const zeroDecimal = isZeroDecimalCurrency(currency);
  const amountInSmallestUnit = zeroDecimal
    ? Math.max(Math.round(valueInCurrency), 1)
    : Math.max(Math.round(valueInCurrency * 100), 50);
  const value = zeroDecimal ? `${amountInSmallestUnit}` : (amountInSmallestUnit / 100).toFixed(2);
  return {
    value,
    amountInSmallestUnit,
    currency,
    exchangeRate: snapshot.vndPerUnit,
    exchangeRateSource: snapshot.source,
    exchangeRateFetchedAt: snapshot.fetchedAt
  };
};
