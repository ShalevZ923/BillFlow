import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";
import type { DashboardBillMeta, DashboardOccurrence } from "./aggregate";

export type FilterState = {
  search: string;
  status: OccurrenceStatus | null;
  category: string | null;
  tag: string | null;
  priority: BillPriority | null;
  cycle: string | null;
};

export type FilterableBill = DashboardBillMeta & {
  occurrences: DashboardOccurrence[];
};

export function filterBills(bills: FilterableBill[], filters: FilterState): FilterableBill[] {
  return bills.filter((bill) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      if (!bill.name.toLowerCase().includes(q) && !bill.category.toLowerCase().includes(q)) {
        return false;
      }
    }

    if (filters.status) {
      const hasStatus = bill.occurrences.some((o) => o.status === filters.status);
      if (!hasStatus) return false;
    }

    if (filters.category && bill.category !== filters.category) {
      return false;
    }

    if (filters.tag && !bill.tags.includes(filters.tag)) {
      return false;
    }

    if (filters.priority && bill.priority !== filters.priority) {
      return false;
    }

    if (filters.cycle && bill.cycle !== filters.cycle) {
      return false;
    }

    return true;
  });
}

export function sortBills(
  bills: FilterableBill[],
  sortBy: "dueDate" | "amount" | "priority" | "status"
): FilterableBill[] {
  const priorityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3
  };
  const statusOrder: Record<string, number> = {
    overdue: 0,
    unpaid: 1,
    paid: 2,
    skipped: 3
  };

  return [...bills].sort((a, b) => {
    if (sortBy === "dueDate") {
      const aDate = a.occurrences[0]?.dueDate ?? "";
      const bDate = b.occurrences[0]?.dueDate ?? "";
      return aDate.localeCompare(bDate);
    }
    if (sortBy === "amount") {
      const aMax = Math.max(...a.occurrences.map((o) => o.amountCents), 0);
      const bMax = Math.max(...b.occurrences.map((o) => o.amountCents), 0);
      return bMax - aMax;
    }
    if (sortBy === "priority") {
      return (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
    }
    if (sortBy === "status") {
      const aMinStatus = Math.min(...a.occurrences.map((o) => statusOrder[o.status] ?? 99));
      const bMinStatus = Math.min(...b.occurrences.map((o) => statusOrder[o.status] ?? 99));
      return aMinStatus - bMinStatus;
    }
    return 0;
  });
}

export function getUniqueCategories(bills: FilterableBill[]): string[] {
  return [...new Set(bills.map((b) => b.category))].sort();
}

export function getUniqueTags(bills: FilterableBill[]): string[] {
  return [...new Set(bills.flatMap((b) => b.tags))].sort();
}
