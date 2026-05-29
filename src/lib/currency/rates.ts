import { getEnv } from "@/lib/env";
import type { ExchangeRates } from "./conversion";
import { supportedCurrencies, type CurrencyCode } from "./supported";

type ExchangeRateResponse = {
  base?: unknown;
  date?: unknown;
  rates?: unknown;
};

type Fetcher = (input: string) => Promise<Response>;

const missingRatesMessage = "Exchange rates response did not include USD, EUR, GBP, and ILS";
const defaultFreshnessMs = 60 * 60 * 1000;

export type ExchangeRateStore = {
  getLatest: () => Promise<ExchangeRates | null>;
  saveLatest: (rates: ExchangeRates) => Promise<void>;
};

function isCurrencyCode(value: unknown): value is CurrencyCode {
  return typeof value === "string" && supportedCurrencies.includes(value as CurrencyCode);
}

function parseUpdatedAt(value: unknown): string {
  if (typeof value !== "string" || value.length === 0) {
    return new Date().toISOString();
  }

  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

function normalizeRates(response: ExchangeRateResponse): ExchangeRates {
  if (!isCurrencyCode(response.base) || response.rates === null || typeof response.rates !== "object") {
    throw new Error(missingRatesMessage);
  }

  const sourceRates = response.rates as Record<string, unknown>;
  const rates = Object.fromEntries(
    supportedCurrencies.map((currency) => [currency, sourceRates[currency]])
  ) as Record<CurrencyCode, unknown>;

  const hasAllSupportedRates = supportedCurrencies.every((currency) => typeof rates[currency] === "number");
  if (!hasAllSupportedRates) {
    throw new Error(missingRatesMessage);
  }

  return {
    base: response.base,
    updatedAt: parseUpdatedAt(response.date),
    rates: rates as Record<CurrencyCode, number>
  };
}

export async function fetchExchangeRates(fetcher: Fetcher = fetch): Promise<ExchangeRates> {
  const response = await fetcher(getEnv().EXCHANGE_RATE_API_URL);
  if (!response.ok) {
    throw new Error(`Exchange rates request failed with status ${response.status}`);
  }

  return normalizeRates((await response.json()) as ExchangeRateResponse);
}

function isFresh(rates: ExchangeRates, now: Date, freshnessMs: number): boolean {
  return now.getTime() - new Date(rates.updatedAt).getTime() < freshnessMs;
}

export async function getPlatformExchangeRates(input: {
  store: ExchangeRateStore;
  fetcher?: Fetcher;
  now?: Date;
  freshnessMs?: number;
}): Promise<ExchangeRates> {
  const now = input.now ?? new Date();
  const freshnessMs = input.freshnessMs ?? defaultFreshnessMs;
  const cachedRates = await input.store.getLatest();

  if (cachedRates && isFresh(cachedRates, now, freshnessMs)) {
    return cachedRates;
  }

  const fetchedRates = await fetchExchangeRates(input.fetcher);
  const platformRates = {
    ...fetchedRates,
    updatedAt: now.toISOString()
  };

  await input.store.saveLatest(platformRates);
  return platformRates;
}
