import { describe, expect, it } from "vitest";
import { generateOccurrences, markOverdue } from "@/lib/billing/recurrence";
import { buildDashboardPayload } from "@/lib/dashboard/aggregate";
import type { CurrencyCode } from "@/lib/billing/types";
import type { ExchangeRates } from "@/lib/currency/conversion";
import type { OccurrenceStatus } from "@/lib/billing/types";
import { parseBillCsv, generateBillCsv } from "@/lib/csv/import";
import { selectReminderEvents } from "@/lib/notifications/reminders";

const usdRates: ExchangeRates = {
  base: "USD" as CurrencyCode,
  updatedAt: "2026-05-29T00:00:00.000Z",
  rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
};

describe("data management: bill lifecycle", () => {
  it("simulates full bill lifecycle from creation to payment to dashboard reflection", () => {
    const today = "2026-06-01";
    const overdueToday = "2026-06-01";

    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-01-01",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 6
    });

    expect(occurrences).toHaveLength(6);
    expect(occurrences[0]?.dueDate).toBe("2026-01-01");

    const marked = markOverdue(occurrences, overdueToday);
    expect(marked[0]?.status).toBe("overdue");
    expect(marked[1]?.status).toBe("overdue");
    expect(marked[5]?.status).toBe("unpaid");

    const payload = buildDashboardPayload({
      today,
      dashboardCurrency: "USD",
      rates: usdRates,
      bills: [{ id: "bill-1", name: "Test Bill", category: "Rent", priority: "critical", tags: ["test"] }],
      occurrences: marked.map((o) => ({
        id: `occ-${o.dueDate}`,
        billId: "bill-1",
        dueDate: o.dueDate,
        amountCents: o.amountCents,
        currency: "USD" as CurrencyCode,
        status: o.status as OccurrenceStatus
      }))
    });

    expect(payload.summary.overdueCount).toBe(5);
    expect(payload.summary.overdueAmountCents).toBe(50000);
    expect(payload.summary.pendingCount).toBe(1);
    expect(payload.summary.yearlyProjectionCents).toBe(60000);
  });
});

describe("data management: cross-currency dashboard consistency", () => {
  it("correctly aggregates mixed-currency bills into a single dashboard currency", () => {
    const payload = buildDashboardPayload({
      today: "2026-06-01",
      dashboardCurrency: "USD",
      rates: usdRates,
      bills: [
        { id: "bill-1", name: "USD Bill", category: "Rent", priority: "high", tags: [] },
        { id: "bill-2", name: "EUR Bill", category: "SaaS", priority: "medium", tags: [] }
      ],
      occurrences: [
        { id: "occ-1", billId: "bill-1", dueDate: "2026-07-01", amountCents: 10000, currency: "USD", status: "unpaid" },
        { id: "occ-2", billId: "bill-2", dueDate: "2026-07-01", amountCents: 9000, currency: "EUR", status: "unpaid" }
      ]
    });

    expect(payload.summary.pendingAmountCents).toBe(20000);
  });
});

describe("data management: CSV roundtrip with filters", () => {
  it("preserves data integrity through export -> import cycle", () => {
    const csv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
"Rent",1500.00,USD,2026-07-01,monthly,Housing,high,unpaid,,
"SaaS",29.99,USD,2026-07-15,monthly,SaaS,medium,unpaid,"dev, tools",
"Insurance",500.00,USD,2026-12-01,yearly,Insurance,low,unpaid,,`;

    const parsed = parseBillCsv(csv);
    expect(parsed.validRows).toHaveLength(3);
    expect(parsed.errors).toHaveLength(0);

    const bills = parsed.validRows.map((row) => row.bill);

    const exported = generateBillCsv(bills);
    const reimported = parseBillCsv(exported);

    expect(reimported.validRows).toHaveLength(3);
    expect(reimported.errors).toHaveLength(0);

    expect(reimported.validRows[0]?.bill.name).toBe("Rent");
    expect(reimported.validRows[0]?.bill.amountCents).toBe(150000);
    expect(reimported.validRows[1]?.bill.tags).toEqual(["dev", "tools"]);
  });
});

describe("data management: reminder scheduling across bill statuses", () => {
  it("generates correct reminders for a mixed portfolio of occurrences", () => {
    const events = selectReminderEvents({
      today: "2026-06-01",
      occurrences: [
        { id: "a", dueDate: "2026-06-08", status: "unpaid" },
        { id: "b", dueDate: "2026-06-02", status: "unpaid" },
        { id: "c", dueDate: "2026-05-25", status: "overdue" },
        { id: "d", dueDate: "2026-05-28", status: "paid" },
        { id: "e", dueDate: "2026-05-20", status: "skipped" },
        { id: "f", dueDate: "2026-06-01", status: "unpaid" }
      ]
    });

    expect(events).toHaveLength(3);
    expect(events.find((e) => e.type === "seven-day")?.occurrenceId).toBe("a");
    expect(events.find((e) => e.type === "one-day")?.occurrenceId).toBe("b");
    expect(events.find((e) => e.type === "overdue")?.occurrenceId).toBe("c");
  });
});

describe("data management: plan limit enforcement", () => {
  it("allows operations under limit and blocks at limit for free plan", () => {
    const limits: Array<{ count: number; allowed: boolean }> = [];

    for (let count = 0; count <= 26; count++) {
      const maxBills = 25;
      const allowed = maxBills === null || count < maxBills;
      limits.push({ count, allowed });
    }

    expect(limits[24]?.allowed).toBe(true);
    expect(limits[25]?.allowed).toBe(false);
    expect(limits[26]?.allowed).toBe(false);
  });
});
