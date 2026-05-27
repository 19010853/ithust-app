import { clearUsdToVndRateCache, getUsdToVndRate } from '@order/services/exchange-rate.service';
import { config } from '@order/config';

jest.mock('@order/config', () => ({
  config: {
    USD_TO_VND_RATE_API_URL: 'https://api.frankfurter.dev/v2/rate/USD/VND',
    getUsdToVndRateFallback: jest.fn(() => 25000)
  }
}));

describe('Exchange rate service', () => {
  const fetchMock: jest.Mock = jest.fn();

  beforeAll(() => {
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  beforeEach(() => {
    clearUsdToVndRateCache();
    jest.clearAllMocks();
  });

  it('should return the Frankfurter USD to VND rate', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ base: 'USD', quote: 'VND', rate: 26237.86 }),
      status: 200
    } as unknown as Response);

    await expect(getUsdToVndRate()).resolves.toBe(26237.86);
    expect(fetchMock).toHaveBeenCalledWith(config.USD_TO_VND_RATE_API_URL, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });

  it('should cache a live rate for later orders', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ rate: 26000 }),
      status: 200
    } as unknown as Response);

    await expect(getUsdToVndRate()).resolves.toBe(26000);
    await expect(getUsdToVndRate()).resolves.toBe(26000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('should use the fallback when the provider request fails', async () => {
    fetchMock.mockRejectedValue(new Error('timeout'));

    await expect(getUsdToVndRate()).resolves.toBe(25000);
    expect(config.getUsdToVndRateFallback).toHaveBeenCalled();
  });

  it('should use the fallback when the provider returns an invalid rate', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ rate: 0 }),
      status: 200
    } as unknown as Response);

    await expect(getUsdToVndRate()).resolves.toBe(25000);
    expect(config.getUsdToVndRateFallback).toHaveBeenCalled();
  });

  it('should fail when the provider and fallback rates are unavailable', async () => {
    fetchMock.mockRejectedValue(new Error('provider unavailable'));
    (config.getUsdToVndRateFallback as jest.Mock).mockImplementationOnce(() => {
      throw new Error('fallback unavailable');
    });

    await expect(getUsdToVndRate()).rejects.toThrow('fallback unavailable');
  });
});
