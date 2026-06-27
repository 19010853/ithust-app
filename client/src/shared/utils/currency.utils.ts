export const GIG_MIN_PRICE_VND = 100000;
export const GIG_MAX_PRICE_VND = 250000000;

const SERVICE_FEE_RATE = 0.055;
const SERVICE_FEE_THRESHOLD_VND = 1250000;
const SERVICE_FEE_FIXED_AMOUNT_VND = 50000;
const SELLER_EARNINGS_RATE = 0.8;

const toFiniteAmount = (value?: number | string): number => {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
};

export const toVndInteger = (value?: number | string): number => Math.round(toFiniteAmount(value));

export const formatVndNumber = (value?: number | string): string =>
  new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(toVndInteger(value));

export const formatVnd = (value?: number | string): string => `${formatVndNumber(value)} VND`;

export const parseVndInput = (value?: string | number): string => `${value ?? ''}`.replace(/\D/g, '');

export const calculateServiceFeeVnd = (price?: number): number => {
  const amount = toFiniteAmount(price);
  if (amount <= 0) {
    return 0;
  }

  return Math.round(amount * SERVICE_FEE_RATE + (amount < SERVICE_FEE_THRESHOLD_VND ? SERVICE_FEE_FIXED_AMOUNT_VND : 0));
};

export const calculateSellerEarningsVnd = (price?: number): number => Math.round(toFiniteAmount(price) * SELLER_EARNINGS_RATE);
