import * as https from 'https';
import { config } from '@users/config';

// Stripe zero-decimal currencies: amount IS the major unit (e.g. 100 JPY = 100, not 10000)
const ZERO_DECIMAL_CURRENCIES = new Set([
  'bif', 'clp', 'djf', 'gnf', 'jpy', 'kmf', 'krw', 'mga', 'pyg', 'rwf', 'ugx', 'vnd', 'vuv', 'xaf', 'xof', 'xpf'
]);

export const isZeroDecimalCurrency = (currency: string): boolean =>
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

// Returns VND per 1 unit of STRIPE_CURRENCY. Fetches from a free public CDN API (no API key required),
// falls back to the configured STRIPE_VND_PER_UNIT if the API is unavailable.
export const getVndPerUnit = async (): Promise<{ vndPerUnit: number; source: string }> => {
  const currency = config.STRIPE_CURRENCY;

  if (cache && cache.currency === currency && Date.now() - cache.cachedAt < CACHE_TTL_MS) {
    return { vndPerUnit: cache.vndPerUnit, source: 'cache' };
  }

  const fromPrimary = await tryFetchRate(CDN_PRIMARY, currency);
  if (fromPrimary) {
    cache = { vndPerUnit: fromPrimary, currency, cachedAt: Date.now() };
    return { vndPerUnit: fromPrimary, source: 'api:fawazahmed0' };
  }

  const fromFallback = await tryFetchRate(CDN_FALLBACK, currency);
  if (fromFallback) {
    cache = { vndPerUnit: fromFallback, currency, cachedAt: Date.now() };
    return { vndPerUnit: fromFallback, source: 'api:fawazahmed0-fallback' };
  }

  return { vndPerUnit: config.STRIPE_VND_PER_UNIT, source: 'fallback:STRIPE_VND_PER_UNIT' };
};
