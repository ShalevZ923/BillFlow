import { describe, expect, it } from "vitest";
import { buildDashboardPayload } from "@/lib/dashboard/aggregate";
import { filterBills, sortBills, getUniqueCategories, getUniqueTags } from "@/lib/dashboard/filters";
import type { FilterableBill } from "@/lib/dashboard/filters";

describe("buildDashboardPayload", () => {
  const rates = {
    base: "USD" as const,
    updatedAt: "2026-05-29T00:00:00.000Z",
    rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
  };

  it("builds summary cards, category totals, monthly breakdown, and upcoming list", () => {
    const payload = buildDashboardPayload({
      today: "2026-05-29",
      dashboardCurrency: "USD",
      rates,
      bills: [
        { id: "bill-1", name: "Office Rent", category: "Rent", priority: "critical", tags: ["office"] },
        { id: "bill-2", name: "GitHub Teams", category: "SaaS", priority: "medium", tags: ["dev"] }
      ],
      occurrences: [
        {
          id: "occ-1",
          billId: "bill-1",
          dueDate: "2026-06-01",
          amountCents: 280000,
          currency: "USD",
          status: "unpaid"
        },
        {
          id: "occ-2",
          billId: "bill-2",
          dueDate: "2026-06-10",
          amountCents: 8400,
          currency: "USD",
          status: "unpaid"
        },
        {
          id: "occ-3",
          billId: "bill-2",
          dueDate: "2026-05-01",
          amountCents: 8400,
          currency: "USD",
          status: "overdue"
        }
      ]
    });

    expect(payload.summary.pendingCount).toBe(2);
    expect(payload.summary.overdueCount).toBe(1);
    expect(payload.summary.overdueAmountCents).toBe(8400);
    expect(payload.summary.monthlyObligationsCents + payload.summary.overdueAmountCents).toBe(296800);
    expect(payload.summary.yearlyProjectionCents).toBe(296800);

    expect(payload.categoryTotals).toContainEqual({ category: "Rent", amountCents: 280000 });
    expect(payload.categoryTotals).toContainEqual({ category: "SaaS", amountCents: 16800 });

    expect(payload.upcoming30Days.map((item) => item.name)).toEqual(["Office Rent", "GitHub Teams"]);
    expect(payload.upcoming30Days[0]?.daysUntilDue).toBeGreaterThanOrEqual(0);
  });

  it("converts amounts to the dashboard currency", () => {
    const payload = buildDashboardPayload({
      today: "2026-05-29",
      dashboardCurrency: "ILS",
      rates,
      bills: [{ id: "bill-1", name: "Test", category: "Other", priority: "medium", tags: [] }],
      occurrences: [
        {
          id: "occ-1",
          billId: "bill-1",
          dueDate: "2026-06-15",
          amountCents: 10000,
          currency: "USD",
          status: "unpaid"
        }
      ]
    });

    expect(payload.summary.pendingAmountCents).toBe(37000);
  });

  it("handles empty bills and occurrences", () => {
    const payload = buildDashboardPayload({
      today: "2026-05-29",
      dashboardCurrency: "USD",
      rates,
      bills: [],
      occurrences: []
    });

    expect(payload.summary.pendingCount).toBe(0);
    expect(payload.summary.overdueCount).toBe(0);
    expect(payload.categoryTotals).toHaveLength(0);
    expect(payload.upcoming30Days).toHaveLength(0);
  });

  it("excludes paid occurrences from pending and unpaid", () => {
    const payload = buildDashboardPayload({
      today: "2026-05-29",
      dashboardCurrency: "USD",
      rates,
      bills: [{ id: "bill-1", name: "Paid Bill", category: "Other", priority: "low", tags: [] }],
      occurrences: [
        {
          id: "occ-1",
          billId: "bill-1",
          dueDate: "2026-06-01",
          amountCents: 10000,
          currency: "USD",
          status: "paid"
        }
      ]
    });

    expect(payload.summary.pendingCount).toBe(0);
    expect(payload.summary.overdueCount).toBe(0);
    expect(payload.summary.yearlyProjectionCents).toBe(10000);
  });

  it("only includes unpaid or overdue in upcoming 30 days", () => {
    const payload = buildDashboardPayload({
      today: "2026-05-29",
      dashboardCurrency: "USD",
      rates,
      bills: [
        { id: "bill-1", name: "Coming", category: "Other", priority: "low", tags: [] },
        { id: "bill-2", name: "Paid Already", category: "Other", priority: "low", tags: [] }
      ],
      occurrences: [
        {
          id: "occ-1",
          billId: "bill-1",
          dueDate: "2026-06-15",
          amountCents: 5000,
          currency: "USD",
          status: "unpaid"
        },
        {
          id: "occ-2",
          billId: "bill-2",
          dueDate: "2026-06-10",
          amountCents: 5000,
          currency: "USD",
          status: "paid"
        }
      ]
    });

    expect(payload.upcoming30Days).toHaveLength(1);
    expect(payload.upcoming30Days[0]?.name).toBe("Coming");
  });
});

describe("dashboard filters", () => {
  const bills: FilterableBill[] = [
    {
      id: "bill-1",
      name: "Office Rent",
      category: "Rent",
      priority: "critical",
      tags: ["office"],
      occurrences: [
        {
          id: "occ-1",
          billId: "bill-1",
          dueDate: "2026-06-01",
          amountCents: 280000,
          currency: "USD",
          status: "unpaid"
        }
      ]
    },
    {
      id: "bill-2",
      name: "GitHub Teams",
      category: "SaaS",
      priority: "medium",
      tags: ["dev"],
      occurrences: [
        {
          id: "occ-2",
          billId: "bill-2",
          dueDate: "2026-05-01",
          amountCents: 8400,
          currency: "USD",
          status: "overdue"
        }
      ]
    },
    {
      id: "bill-3",
      name: "AWS Invoice",
      category: "Cloud",
      priority: "high",
      tags: ["dev", "cloud"],
      occurrences: [
        {
          id: "occ-3",
          billId: "bill-3",
          dueDate: "2026-06-15",
          amountCents: 12000,
          currency: "USD",
          status: "unpaid"
        }
      ]
    }
  ];

  it("filters by search text matching name or category", () => {
    expect(filterBills(bills, { search: "rent", status: null, category: null, tag: null, priority: null, cycle: null })).toHaveLength(1);
    expect(filterBills(bills, { search: "saas", status: null, category: null, tag: null, priority: null, cycle: null })).toHaveLength(1);
    expect(filterBills(bills, { search: "xyz", status: null, category: null, tag: null, priority: null, cycle: null })).toHaveLength(0);
  });

  it("filters by status using occurrences", () => {
    expect(filterBills(bills, { search: "", status: "overdue", category: null, tag: null, priority: null, cycle: null })).toHaveLength(1);
    expect(filterBills(bills, { search: "", status: "unpaid", category: null, tag: null, priority: null, cycle: null })).toHaveLength(2);
  });

  it("filters by category", () => {
    expect(filterBills(bills, { search: "", status: null, category: "Rent", tag: null, priority: null, cycle: null })).toHaveLength(1);
  });

  it("filters by tag", () => {
    expect(filterBills(bills, { search: "", status: null, category: null, tag: "dev", priority: null, cycle: null })).toHaveLength(2);
    expect(filterBills(bills, { search: "", status: null, category: null, tag: "cloud", priority: null, cycle: null })).toHaveLength(1);
  });

  it("filters by priority", () => {
    expect(filterBills(bills, { search: "", status: null, category: null, tag: null, priority: "critical", cycle: null })).toHaveLength(1);
  });

  it("combines multiple filters", () => {
    const result = filterBills(bills, {
      search: "",
      status: "unpaid",
      category: null,
      tag: "dev",
      priority: null,
      cycle: null
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.name).toBe("AWS Invoice");
  });

  it("returns empty array when no bills match", () => {
    expect(filterBills(bills, { search: "", status: null, category: "Nonexistent", tag: null, priority: null, cycle: null })).toHaveLength(0);
  });
});

describe("sortBills", () => {
  const bills: FilterableBill[] = [
    {
      id: "bill-1",
      name: "A",
      category: "Other",
      priority: "low",
      tags: [],
      occurrences: [{ id: "o1", billId: "bill-1", dueDate: "2026-06-10", amountCents: 1000, currency: "USD", status: "unpaid" }]
    },
    {
      id: "bill-2",
      name: "B",
      category: "Other",
      priority: "critical",
      tags: [],
      occurrences: [{ id: "o2", billId: "bill-2", dueDate: "2026-05-01", amountCents: 50000, currency: "USD", status: "overdue" }]
    },
    {
      id: "bill-3",
      name: "C",
      category: "Other",
      priority: "high",
      tags: [],
      occurrences: [{ id: "o3", billId: "bill-3", dueDate: "2026-06-20", amountCents: 10000, currency: "USD", status: "paid" }]
    }
  ];

  it("sorts by due date ascending", () => {
    const sorted = sortBills(bills, "dueDate");
    expect(sorted[0]?.id).toBe("bill-2");
    expect(sorted[2]?.id).toBe("bill-3");
  });

  it("sorts by amount descending", () => {
    const sorted = sortBills(bills, "amount");
    expect(sorted[0]?.id).toBe("bill-2");
  });

  it("sorts by priority ascending (critical first)", () => {
    const sorted = sortBills(bills, "priority");
    expect(sorted[0]?.priority).toBe("critical");
    expect(sorted[2]?.priority).toBe("low");
  });

  it("sorts by status (overdue first)", () => {
    const sorted = sortBills(bills, "status");
    expect(sorted[0]?.occurrences[0]?.status).toBe("overdue");
  });
});

describe("getUniqueCategories", () => {
  it("returns sorted unique categories", () => {
    const bills: FilterableBill[] = [
      { id: "1", name: "A", category: "Rent", priority: "low", tags: [], occurrences: [] },
      { id: "2", name: "B", category: "SaaS", priority: "low", tags: [], occurrences: [] },
      { id: "3", name: "C", category: "Rent", priority: "low", tags: [], occurrences: [] }
    ];
    expect(getUniqueCategories(bills)).toEqual(["Rent", "SaaS"]);
  });
});

describe("getUniqueTags", () => {
  it("returns sorted unique tags", () => {
    const bills: FilterableBill[] = [
      { id: "1", name: "A", category: "Other", priority: "low", tags: ["dev", "cloud"], occurrences: [] },
      { id: "2", name: "B", category: "Other", priority: "low", tags: ["dev"], occurrences: [] }
    ];
    expect(getUniqueTags(bills)).toEqual(["cloud", "dev"]);
  });
});
