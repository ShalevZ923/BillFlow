import { describe, expect, it } from "vitest";
import { filterDashboardDataByPeriod } from "@/lib/dashboard/period";
import type { DashboardBillMeta, DashboardOccurrence } from "@/lib/dashboard/aggregate";

const bills: DashboardBillMeta[] = [
  { id: "bill-jan", name: "January Bill", category: "Office", priority: "medium", tags: [] },
  { id: "bill-jun", name: "June Bill", category: "SaaS", priority: "high", tags: [] },
  { id: "bill-next-year", name: "Next Year Bill", category: "Legal", priority: "low", tags: [] }
];

const occurrences: DashboardOccurrence[] = [
  { id: "occ-jan", billId: "bill-jan", dueDate: "2026-01-15", amountCents: 1000, currency: "USD", status: "paid" },
  { id: "occ-jun", billId: "bill-jun", dueDate: "2026-06-20", amountCents: 2000, currency: "USD", status: "unpaid" },
  { id: "occ-jun-2", billId: "bill-jun", dueDate: "2026-06-30", amountCents: 3000, currency: "USD", status: "unpaid" },
  { id: "occ-next-year", billId: "bill-next-year", dueDate: "2027-01-05", amountCents: 4000, currency: "USD", status: "unpaid" }
];

describe("filterDashboardDataByPeriod", () => {
  it("keeps all bills and occurrences for overview", () => {
    const result = filterDashboardDataByPeriod({ bills, occurrences, period: "overview", today: "2026-06-10" });

    expect(result.bills.map((bill) => bill.id)).toEqual(["bill-jan", "bill-jun", "bill-next-year"]);
    expect(result.occurrences.map((occurrence) => occurrence.id)).toEqual(["occ-jan", "occ-jun", "occ-jun-2", "occ-next-year"]);
  });

  it("keeps only current-month occurrences and their bills", () => {
    const result = filterDashboardDataByPeriod({ bills, occurrences, period: "month", today: "2026-06-10" });

    expect(result.bills.map((bill) => bill.id)).toEqual(["bill-jun"]);
    expect(result.occurrences.map((occurrence) => occurrence.id)).toEqual(["occ-jun", "occ-jun-2"]);
  });

  it("keeps only current-year occurrences and their bills", () => {
    const result = filterDashboardDataByPeriod({ bills, occurrences, period: "year", today: "2026-06-10" });

    expect(result.bills.map((bill) => bill.id)).toEqual(["bill-jan", "bill-jun"]);
    expect(result.occurrences.map((occurrence) => occurrence.id)).toEqual(["occ-jan", "occ-jun", "occ-jun-2"]);
  });
});
