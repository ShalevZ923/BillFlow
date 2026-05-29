import { describe, expect, it } from "vitest";
import { createExchangeRateStore } from "@/lib/currency/store";

describe("createExchangeRateStore", () => {
  it("reads the global exchange rate snapshot", async () => {
    const row = {
      id: "global",
      base: "USD",
      updatedAt: new Date("2026-05-29T11:00:00.000Z"),
      rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 },
      createdAt: new Date("2026-05-29T11:00:00.000Z")
    };
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [row]
          })
        })
      })
    };

    await expect(createExchangeRateStore(db as never).getLatest()).resolves.toEqual({
      base: "USD",
      updatedAt: "2026-05-29T11:00:00.000Z",
      rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
    });
  });

  it("upserts the global exchange rate snapshot", async () => {
    const writes: unknown[] = [];
    const db = {
      insert: () => ({
        values: (values: unknown) => ({
          onConflictDoUpdate: async (config: unknown) => {
            writes.push({ values, config });
          }
        })
      })
    };

    await createExchangeRateStore(db as never).saveLatest({
      base: "USD",
      updatedAt: "2026-05-29T11:00:00.000Z",
      rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
    });

    expect(writes).toHaveLength(1);
    expect(writes[0]).toMatchObject({
      values: {
        id: "global",
        base: "USD",
        rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 },
        updatedAt: new Date("2026-05-29T11:00:00.000Z")
      }
    });
  });
});
