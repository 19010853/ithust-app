import { config } from '@order/config';

interface IFrankfurterRateResponse {
  rate?: unknown;
}

interface IUsdToVndRateCache {
  expiresAt: number;
  rate: number;
}

const USD_TO_VND_RATE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const USD_TO_VND_RATE_FETCH_TIMEOUT_MS = 5000;
let usdToVndRateCache: IUsdToVndRateCache | undefined;

const validateRate = (rate: unknown): number => {
  const numericRate: number = Number(rate);
  if (!Number.isFinite(numericRate) || numericRate <= 0) {
    throw new Error('USD to VND rate response must contain a positive rate.');
  }
  return numericRate;
};

const getCachedUsdToVndRate = (): number | undefined => {
  if (usdToVndRateCache && Date.now() < usdToVndRateCache.expiresAt) {
    return usdToVndRateCache.rate;
  }
  return undefined;
};

const fetchUsdToVndRate = async (): Promise<number> => {
  if (!config.USD_TO_VND_RATE_API_URL) {
    throw new Error('USD_TO_VND_RATE_API_URL must be configured.');
  }

  const controller: AbortController = new AbortController();
  const timeout: NodeJS.Timeout = setTimeout(() => controller.abort(), USD_TO_VND_RATE_FETCH_TIMEOUT_MS);

  try {
    const response: Response = await fetch(config.USD_TO_VND_RATE_API_URL, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`USD to VND rate API request failed with status ${response.status}.`);
    }

    const data: IFrankfurterRateResponse = (await response.json()) as IFrankfurterRateResponse;
    return validateRate(data.rate);
  } finally {
    clearTimeout(timeout);
  }
};

const cacheUsdToVndRate = (rate: number): number => {
  usdToVndRateCache = {
    expiresAt: Date.now() + USD_TO_VND_RATE_CACHE_TTL_MS,
    rate
  };
  return rate;
};

export const getUsdToVndRate = async (): Promise<number> => {
  const cachedRate: number | undefined = getCachedUsdToVndRate();
  if (cachedRate) {
    return cachedRate;
  }

  try {
    return cacheUsdToVndRate(await fetchUsdToVndRate());
  } catch (error) {
    return config.getUsdToVndRateFallback();
  }
};

export const clearUsdToVndRateCache = (): void => {
  usdToVndRateCache = undefined;
};
