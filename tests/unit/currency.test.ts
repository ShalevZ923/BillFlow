import { describe, expect, it } from "vitest";
import { convertAmount, convertToMany } from "@/lib/currency/conversion";
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
});

describe("fetchExchangeRates", () => {
  it("normalizes API responses to supported exchange rates", async () => {
    const rates = await fetchExchangeRates(async () => {
      return Response.json({
        base: "USD",
        date: "2026-05-29",
        rates: {
          USD: 1,
          EUR: 0.9,
          GBP: 0.78,
          ILS: 3.7,
          JPY: 157
        }
      });
    });

    expect(rates).toEqual({
      base: "USD",
      updatedAt: "2026-05-29T00:00:00.000Z",
      rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
    });
  });

  it("rejects API responses missing required supported currencies", async () => {
    await expect(
      fetchExchangeRates(async () => {
        return Response.json({
          base: "USD",
          date: "2026-05-29",
          rates: {
            USD: 1,
            EUR: 0.9,
            GBP: 0.78
          }
        });
      })
    ).rejects.toThrow("Exchange rates response did not include USD, EUR, GBP, and ILS");
  });
});

describe("getPlatformExchangeRates", () => {
  const cachedRates = {
    base: "USD" as const,
    updatedAt: "2026-05-29T10:30:00.000Z",
    rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
  };

  it("returns fresh platform cached rates without calling the external API", async () => {
    const store: ExchangeRateStore = {
      getLatest: async () => cachedRates,
      saveLatest: async () => {
        throw new Error("fresh rates should not be saved again");
      }
    };

    const rates = await getPlatformExchangeRates({
      store,
      fetcher: async () => {
        throw new Error("fresh rates should not call the external API");
      },
      now: new Date("2026-05-29T11:00:00.000Z")
    });

    expect(rates).toEqual(cachedRates);
  });

  it("refreshes and stores stale platform rates", async () => {
    const savedRates: unknown[] = [];
    const store: ExchangeRateStore = {
      getLatest: async () => ({
        ...cachedRates,
        updatedAt: "2026-05-29T09:00:00.000Z"
      }),
      saveLatest: async (rates) => {
        savedRates.push(rates);
      }
    };

    const rates = await getPlatformExchangeRates({
      store,
      fetcher: async () =>
        Response.json({
          base: "USD",
          date: "2026-05-29",
          rates: { USD: 1, EUR: 0.91, GBP: 0.79, ILS: 3.72 }
        }),
      now: new Date("2026-05-29T11:00:00.000Z")
    });

    expect(rates.rates).toEqual({ USD: 1, EUR: 0.91, GBP: 0.79, ILS: 3.72 });
    expect(savedRates).toEqual([rates]);
  });
});
