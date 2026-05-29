import type { CurrencyCode } from "./supported";

export type ExchangeRates = {
  base: CurrencyCode;
  updatedAt: string;
  rates: Record<CurrencyCode, number>;
};

export function convertAmount(input: {
  amountCents: number;
  from: CurrencyCode;
  to: CurrencyCode;
  rates: ExchangeRates;
}): number {
  if (input.from === input.to) return input.amountCents;

  const amountInBaseCurrency = input.amountCents / input.rates.rates[input.from];
  return Math.round(amountInBaseCurrency * input.rates.rates[input.to]);
}

export function convertToMany(input: {
  amountCents: number;
  from: CurrencyCode;
  targets: CurrencyCode[];
  rates: ExchangeRates;
}): Array<{ currency: CurrencyCode; amountCents: number }> {
  return input.targets.map((target) => ({
    currency: target,
    amountCents: convertAmount({ amountCents: input.amountCents, from: input.from, to: target, rates: input.rates })
  }));
}
