import { describe, expect, it } from "vitest";
import { convertToMany } from "@/lib/currency/conversion";

describe("currency conversion routes", () => {
  const rates = {
    base: "USD" as const,
    updatedAt: "2026-05-29T00:00:00.000Z",
    rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 }
  };

  it("converts USD to multiple currencies", () => {
    const results = convertToMany({
      amountCents: 10000,
      from: "USD",
      targets: ["EUR", "GBP", "ILS"],
      rates
    });

    expect(results).toHaveLength(3);
    expect(results[0]?.currency).toBe("EUR");
    expect(results[0]?.amountCents).toBe(9200);
    expect(results[2]?.currency).toBe("ILS");
    expect(results[2]?.amountCents).toBe(36500);
  });

  it("converts from non-USD base", () => {
    const results = convertToMany({
      amountCents: 10000,
      from: "EUR",
      targets: ["USD"],
      rates
    });

    expect(results[0]?.currency).toBe("USD");
    expect(results[0]?.amountCents).toBeGreaterThan(10000);
  });

  it("returns empty array for empty targets", () => {
    const results = convertToMany({
      amountCents: 10000,
      from: "USD",
      targets: [],
      rates
    });

    expect(results).toHaveLength(0);
  });
});
