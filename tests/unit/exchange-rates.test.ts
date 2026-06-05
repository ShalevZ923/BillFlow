import { describe, expect, it } from "vitest";
import { supportedCurrencies } from "@/lib/billing/types";
import { convertToMany, convertAmount } from "@/lib/currency/conversion";
import { selectReminderEvents } from "@/lib/notifications/reminders";
import type { CurrencyCode } from "@/lib/billing/types";

const mockRates = {
  base: "USD" as const,
  updatedAt: "2026-06-05T00:00:00.000Z",
  rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 } as Record<CurrencyCode, number>
};

describe("exchange rates: normalization and conversion", () => {
  it("converts USD to EUR at correct rate", () => {
    const result = convertAmount({ amountCents: 10000, from: "USD", to: "EUR", rates: mockRates });
    expect(result).toBe(9200);
  });

  it("converts EUR to USD at inverse rate", () => {
    const result = convertAmount({ amountCents: 9200, from: "EUR", to: "USD", rates: mockRates });
    expect(result).toBe(10000);
  });

  it("same-currency conversion returns same amount", () => {
    const result = convertAmount({ amountCents: 5000, from: "USD", to: "USD", rates: mockRates });
    expect(result).toBe(5000);
  });

  it("converts via cross-rate (non-USD base pair)", () => {
    const result = convertAmount({ amountCents: 10000, from: "EUR", to: "GBP", rates: mockRates });
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(12000);
  });

  it("convertToMany returns correct number of target currencies", () => {
    const results = convertToMany({
      amountCents: 10000,
      from: "USD",
      targets: ["EUR", "GBP", "ILS"],
      rates: mockRates
    });
    expect(results).toHaveLength(3);
    expect(results.map((r) => r.currency)).toEqual(["EUR", "GBP", "ILS"]);
  });

  it("handles empty targets array", () => {
    const results = convertToMany({
      amountCents: 10000,
      from: "USD",
      targets: [],
      rates: mockRates
    });
    expect(results).toHaveLength(0);
  });

  it("all supported currencies are present in valid rates", () => {
    for (const currency of supportedCurrencies) {
      expect(typeof mockRates.rates[currency]).toBe("number");
      expect(mockRates.rates[currency]).toBeGreaterThan(0);
    }
  });
});

describe("reminder selection: edge cases and batch operations", () => {
  it("selects only overdue when all items are past due and unpaid", () => {
    const events = selectReminderEvents({
      today: "2026-06-10",
      occurrences: [
        { id: "a", dueDate: "2026-05-01", status: "unpaid" },
        { id: "b", dueDate: "2026-05-15", status: "unpaid" },
        { id: "c", dueDate: "2026-05-20", status: "unpaid" }
      ]
    });
    expect(events).toHaveLength(3);
    expect(events.every((e) => e.type === "overdue")).toBe(true);
  });

  it("handles mixed statuses across a week", () => {
    const today = "2026-06-01";
    const occurrences = [
      { id: "paid", dueDate: "2026-06-03", status: "paid" as const },
      { id: "skipped", dueDate: "2026-06-04", status: "skipped" as const },
      { id: "one-day", dueDate: "2026-06-02", status: "unpaid" as const },
      { id: "seven-day", dueDate: "2026-06-08", status: "unpaid" as const },
      { id: "overdue", dueDate: "2026-05-25", status: "unpaid" as const }
    ];

    const events = selectReminderEvents({ today, occurrences });
    expect(events.filter((e) => e.type === "seven-day")).toHaveLength(1);
    expect(events.filter((e) => e.type === "one-day")).toHaveLength(1);
    expect(events.filter((e) => e.type === "overdue")).toHaveLength(1);
    expect(events).toHaveLength(3);
  });

  it("does not generate duplicate events for an occurrence", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "a", dueDate: "2026-05-28", status: "overdue" }
      ]
    });
    expect(events).toHaveLength(1);
  });

  it("exactly 7 days before due triggers seven-day", () => {
    const events = selectReminderEvents({
      today: "2026-06-01",
      occurrences: [
        { id: "a", dueDate: "2026-06-08", status: "unpaid" }
      ]
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("seven-day");
  });
});

describe("currency store: supported currencies integrity", () => {
  it("has exactly 4 supported currencies", () => {
    expect(supportedCurrencies).toHaveLength(4);
    expect(supportedCurrencies).toContain("USD");
    expect(supportedCurrencies).toContain("EUR");
    expect(supportedCurrencies).toContain("GBP");
    expect(supportedCurrencies).toContain("ILS");
  });
});
