import type { DashboardBillMeta, DashboardOccurrence } from "@/lib/dashboard/aggregate";

export type DashboardPeriod = "overview" | "month" | "year";

type FilterDashboardDataInput = {
  bills: DashboardBillMeta[];
  occurrences: DashboardOccurrence[];
  period: DashboardPeriod;
  today: string;
};

export function isDateInDashboardPeriod(date: string, period: DashboardPeriod, today: string): boolean {
  if (period === "overview") {
    return true;
  }

  if (period === "month") {
    return date.startsWith(today.slice(0, 7));
  }

  return date.startsWith(today.slice(0, 4));
}

export function filterDashboardDataByPeriod({
  bills,
  occurrences,
  period,
  today
}: FilterDashboardDataInput): { bills: DashboardBillMeta[]; occurrences: DashboardOccurrence[] } {
  if (period === "overview") {
    return { bills, occurrences };
  }

  const filteredOccurrences = occurrences.filter((occurrence) =>
    isDateInDashboardPeriod(occurrence.dueDate, period, today)
  );
  const billIds = new Set(filteredOccurrences.map((occurrence) => occurrence.billId));

  return {
    bills: bills.filter((bill) => billIds.has(bill.id)),
    occurrences: filteredOccurrences
  };
}

export function filterBillItemsByPeriod<T extends { dueDate: string }>(
  bills: T[],
  period: DashboardPeriod,
  today: string
): T[] {
  if (period === "overview") {
    return bills;
  }

  return bills.filter((bill) => isDateInDashboardPeriod(bill.dueDate, period, today));
}
