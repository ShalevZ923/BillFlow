import { parseISO, differenceInDays, isBefore, isAfter, addDays } from "date-fns";
import type { BillPriority, CurrencyCode, OccurrenceStatus } from "@/lib/billing/types";
import type { ExchangeRates } from "@/lib/currency/conversion";
import { convertAmount } from "@/lib/currency/conversion";

export type DashboardBillMeta = {
  id: string;
  name: string;
  vendor?: string;
  category: string;
  priority: BillPriority | string;
  tags: string[];
  cycle?: string;
};

export type DashboardOccurrence = {
  id: string;
  billId: string;
  dueDate: string;
  amountCents: number;
  currency: CurrencyCode;
  status: OccurrenceStatus;
};

export type DashboardPayment = {
  id: string;
  paidAmountCents: number;
  paidCurrency: CurrencyCode;
  paidDate: string;
};

export type DashboardPayload = {
  summary: {
    monthlyObligationsCents: number;
    yearlyProjectionCents: number;
    pendingCount: number;
    pendingAmountCents: number;
    overdueCount: number;
    overdueAmountCents: number;
    dueThisWeekCount: number;
    paidMonthToDateCents: number;
  };
  categoryTotals: Array<{ category: string; amountCents: number }>;
  monthlyBreakdown: Array<{ month: string; amountCents: number }>;
  upcoming30Days: Array<{
    id: string;
    billId: string;
    name: string;
    dueDate: string;
    amountCents: number;
    currency: CurrencyCode;
    status: OccurrenceStatus;
    daysUntilDue: number;
  }>;
  dueQueue: Array<{
    id: string;
    billId: string;
    name: string;
    vendor: string;
    category: string;
    priority: BillPriority | string;
    tags: string[];
    dueDate: string;
    amountCents: number;
    currency: CurrencyCode;
    status: OccurrenceStatus;
    daysUntilDue: number;
  }>;
};

function convertOccurrenceAmount(
  occurrence: DashboardOccurrence,
  dashboardCurrency: CurrencyCode,
  rates: ExchangeRates
): number {
  return convertAmount({
    amountCents: occurrence.amountCents,
    from: occurrence.currency,
    to: dashboardCurrency,
    rates
  });
}

export function buildDashboardPayload(input: {
  today: string;
  dashboardCurrency: CurrencyCode;
  rates: ExchangeRates;
  bills: DashboardBillMeta[];
  occurrences: DashboardOccurrence[];
  payments?: DashboardPayment[];
}): DashboardPayload {
  const billMap = new Map(input.bills.map((b) => [b.id, b]));
  const todayDate = parseISO(input.today);
  const thirtyDaysOut = addDays(todayDate, 30);

  let monthlyObligationsCents = 0;
  let yearlyProjectionCents = 0;
  let pendingCount = 0;
  let pendingAmountCents = 0;
  let overdueCount = 0;
  let overdueAmountCents = 0;
  let dueThisWeekCount = 0;
  let paidMonthToDateCents = 0;

  const currentMonthKey = todayDate.toISOString().slice(0, 7);

  const categoryTotalsMap = new Map<string, number>();
  const monthlyBreakdownMap = new Map<string, number>();
  const upcomingList: DashboardPayload["upcoming30Days"] = [];
  const dueQueue: DashboardPayload["dueQueue"] = [];

  for (const occurrence of input.occurrences) {
    const bill = billMap.get(occurrence.billId);
    const converted = convertOccurrenceAmount(occurrence, input.dashboardCurrency, input.rates);
    const dueDate = parseISO(occurrence.dueDate);
    const monthKey = dueDate.toISOString().slice(0, 7);

    if (occurrence.status === "overdue") {
      overdueCount++;
      overdueAmountCents += converted;
      yearlyProjectionCents += converted;
    }

    if (occurrence.status === "unpaid") {
      pendingCount++;
      pendingAmountCents += converted;

      if (monthKey === currentMonthKey && !isBefore(dueDate, todayDate)) {
        monthlyObligationsCents += converted;
      }

      yearlyProjectionCents += converted;
    }

    if (occurrence.status === "paid") {
      yearlyProjectionCents += converted;
    }

    if (occurrence.status !== "skipped") {
      const category = bill?.category ?? "Other";
      categoryTotalsMap.set(category, (categoryTotalsMap.get(category) ?? 0) + converted);

      monthlyBreakdownMap.set(monthKey, (monthlyBreakdownMap.get(monthKey) ?? 0) + converted);
    }

    const isOpenOccurrence = occurrence.status === "unpaid" || occurrence.status === "overdue";
    const daysUntilDue = differenceInDays(dueDate, todayDate);
    const isWithinNextThirtyDays = !isAfter(dueDate, thirtyDaysOut);

    if (isOpenOccurrence && daysUntilDue >= 0 && daysUntilDue <= 7) {
      dueThisWeekCount++;
    }

    if (isOpenOccurrence && isWithinNextThirtyDays) {
      dueQueue.push({
        id: occurrence.id,
        billId: occurrence.billId,
        name: bill?.name ?? "Unknown",
        vendor: bill?.vendor ?? "",
        category: bill?.category ?? "Other",
        priority: bill?.priority ?? "medium",
        tags: bill?.tags ?? [],
        dueDate: occurrence.dueDate,
        amountCents: converted,
        currency: input.dashboardCurrency,
        status: occurrence.status,
        daysUntilDue
      });
    }

    if (isOpenOccurrence && isAfter(dueDate, todayDate) && isBefore(dueDate, thirtyDaysOut)) {
      upcomingList.push({
        id: occurrence.id,
        billId: occurrence.billId,
        name: bill?.name ?? "Unknown",
        dueDate: occurrence.dueDate,
        amountCents: converted,
        currency: input.dashboardCurrency,
        status: occurrence.status,
        daysUntilDue
      });
    }
  }

  upcomingList.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  dueQueue.sort((a, b) => {
    if (a.daysUntilDue !== b.daysUntilDue) return a.daysUntilDue - b.daysUntilDue;
    return a.name.localeCompare(b.name);
  });

  for (const payment of input.payments ?? []) {
    const paidDate = parseISO(payment.paidDate);
    const paidMonthKey = paidDate.toISOString().slice(0, 7);

    if (paidMonthKey === currentMonthKey && !isAfter(paidDate, todayDate)) {
      paidMonthToDateCents += convertAmount({
        amountCents: payment.paidAmountCents,
        from: payment.paidCurrency,
        to: input.dashboardCurrency,
        rates: input.rates
      });
    }
  }

  return {
    summary: {
      monthlyObligationsCents,
      yearlyProjectionCents,
      pendingCount,
      pendingAmountCents,
      overdueCount,
      overdueAmountCents,
      dueThisWeekCount,
      paidMonthToDateCents
    },
    categoryTotals: Array.from(categoryTotalsMap.entries())
      .map(([category, amountCents]) => ({ category, amountCents }))
      .sort((a, b) => b.amountCents - a.amountCents),
    monthlyBreakdown: Array.from(monthlyBreakdownMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amountCents]) => ({ month, amountCents })),
    upcoming30Days: upcomingList,
    dueQueue
  };
}
