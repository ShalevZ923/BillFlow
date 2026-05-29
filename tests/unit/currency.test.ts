import { describe, expect, it } from "vitest";
import { convertAmount, convertToMany } from "@/lib/currency/conversion";
import type { ExchangeRates } from "@/lib/currency/conversion";
import { fetchExchangeRates, getPlatformExchangeRates, type ExchangeRateStore } from "@/lib/currency/rates";

describe("currency conversion", () => {
  const rates = {
    base: "USD" as const,
    updatedAt: "2026-05-29T00:00:00.000Z",
    rates: { USD: 1, EUR: 0.9, ILS: 3.7, GBP: 0.78 }
  };

  it("converts cents between currencies", () => {
    expect(convertAmount({ amountCents: 10000, from: "USD", to: "ILS", rates })).toBe(37000);
  });

  it("converts one amount into many target currencies", () => {
    expect(convertToMany({ amountCents: 10000, from: "USD", targets: ["EUR", "GBP"], rates })).toEqual([
      { currency: "EUR", amountCents: 9000 },
      { currency: "GBP", amountCents: 7800 }
    ]);
  });

  it("handles same-currency conversion as no-op", () => {
    expect(convertAmount({ amountCents: 10000, from: "USD", to: "USD", rates })).toBe(10000);
  });

  it("converts from non-USD base via cross-rate", () => {
    const result = convertAmount({ amountCents: 9000, from: "EUR", to: "ILS", rates });
    expect(result).toBe(37000);
  });

  it("handles zero amount conversion", () => {
    expect(convertAmount({ amountCents: 0, from: "USD", to: "ILS", rates })).toBe(0);
  });

  it("converts to empty target list", () => {
    expect(convertToMany({ amountCents: 10000, from: "USD", targets: [], rates })).toEqual([]);
  });
});

describe("fetchExchangeRates", () => {
  function makeResponse(status: number, body: unknown): Response {
    return {
      ok: status >= 200 && status < 300,
      status,
      json: async () => body
    } as Response;
  }

  const validBody = {
    base: "USD",
    date: "2026-05-29",
    rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 }
  };

  it("normalizes valid API response", async () => {
    const result = await fetchExchangeRates(() => Promise.resolve(makeResponse(200, validBody)));

    expect(result.base).toBe("USD");
    expect(result.rates.USD).toBe(1);
    expect(result.rates.EUR).toBe(0.92);
    expect(result.updatedAt).toBe("2026-05-29T00:00:00.000Z");
  });

  it("rejects when a required currency is missing", async () => {
    const body = { base: "USD", date: "2026-05-29", rates: { USD: 1, EUR: 0.92 } };

    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)))
    ).rejects.toThrow("did not include");
  });

  it("throws on HTTP error status", async () => {
    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(500, {})))
    ).rejects.toThrow("failed with status 500");
  });

  it("throws on 429 rate limit", async () => {
    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(429, {})))
    ).rejects.toThrow("failed with status 429");
  });

  it("throws on network failure", async () => {
    await expect(
      fetchExchangeRates(() => Promise.reject(new TypeError("fetch failed")))
    ).rejects.toThrow("fetch failed");
  });

  it("rejects response with null rates", async () => {
    const body = { base: "USD", date: "2026-05-29", rates: null };

    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)))
    ).rejects.toThrow("did not include");
  });

  it("rejects response with array rates", async () => {
    const body = { base: "USD", date: "2026-05-29", rates: [1, 2, 3] };

    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)))
    ).rejects.toThrow("did not include");
  });

  it("rejects response with non-numeric rate values", async () => {
    const body = { base: "USD", date: "2026-05-29", rates: { USD: "1.0", EUR: 0.92, GBP: 0.79, ILS: 3.65 } };

    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)))
    ).rejects.toThrow("did not include");
  });

  it("rejects response with invalid base currency", async () => {
    const body = { base: "JPY", date: "2026-05-29", rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 } };

    await expect(
      fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)))
    ).rejects.toThrow("did not include");
  });

  it("falls back to current date on invalid date string", async () => {
    const body = { base: "USD", date: "not-a-real-date", rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 } };

    const result = await fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)));

    expect(result.base).toBe("USD");
    expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(0);
  });

  it("falls back to current date on empty date string", async () => {
    const body = { base: "USD", date: "", rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 } };

    const result = await fetchExchangeRates(() => Promise.resolve(makeResponse(200, body)));

    expect(new Date(result.updatedAt).getTime()).toBeGreaterThan(0);
  });
});

describe("getPlatformExchangeRates", () => {
  const validBody = {
    base: "USD",
    date: "2026-05-29",
    rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 }
  };

  function makeStore(overrides: { getLatest?: () => Promise<ExchangeRates | null>; saveLatest?: () => Promise<void> } = {}): ExchangeRateStore {
    return {
      getLatest: overrides.getLatest ?? (() => Promise.resolve(null)),
      saveLatest: overrides.saveLatest ?? (() => Promise.resolve())
    };
  }

  it("fetches fresh rates when no cache exists", async () => {
    const result = await getPlatformExchangeRates({
      store: makeStore(),
      fetcher: () => Promise.resolve({ ok: true, status: 200, json: async () => validBody } as Response),
      now: new Date("2026-05-29T12:00:00Z")
    });

    expect(result.rates.ILS).toBe(3.65);
  });

  it("returns cached rates when still fresh", async () => {
    const cached = {
      base: "USD" as const,
      updatedAt: "2026-05-29T11:30:00.000Z",
      rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
    };

    const result = await getPlatformExchangeRates({
      store: makeStore({ getLatest: () => Promise.resolve(cached) }),
      now: new Date("2026-05-29T11:45:00Z"),
      freshnessMs: 60 * 60 * 1000
    });

    expect(result.rates.ILS).toBe(3.7);
  });

  it("refreshes stale cached rates", async () => {
    const stale = {
      base: "USD" as const,
      updatedAt: "2026-05-28T12:00:00.000Z",
      rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
    };

    const result = await getPlatformExchangeRates({
      store: makeStore({ getLatest: () => Promise.resolve(stale) }),
      fetcher: () => Promise.resolve({ ok: true, status: 200, json: async () => validBody } as Response),
      now: new Date("2026-05-29T12:00:00Z"),
      freshnessMs: 60 * 60 * 1000
    });

    expect(result.rates.ILS).toBe(3.65);
  });
});
