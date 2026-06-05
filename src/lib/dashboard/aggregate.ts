import { parseISO, differenceInDays, isBefore, isAfter, addDays } from "date-fns";
import type { CurrencyCode, OccurrenceStatus } from "@/lib/billing/types";
import type { ExchangeRates } from "@/lib/currency/conversion";
import { convertAmount } from "@/lib/currency/conversion";

export type DashboardBillMeta = {
  id: string;
  name: string;
  category: string;
  priority: string;
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

export type DashboardPayload = {
  summary: {
    monthlyObligationsCents: number;
    yearlyProjectionCents: number;
    pendingCount: number;
    pendingAmountCents: number;
    overdueCount: number;
    overdueAmountCents: number;
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

  const currentMonthKey = todayDate.toISOString().slice(0, 7);

  const categoryTotalsMap = new Map<string, number>();
  const monthlyBreakdownMap = new Map<string, number>();
  const upcomingList: DashboardPayload["upcoming30Days"] = [];

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

    const category = bill?.category ?? "Other";
    categoryTotalsMap.set(category, (categoryTotalsMap.get(category) ?? 0) + converted);

    monthlyBreakdownMap.set(monthKey, (monthlyBreakdownMap.get(monthKey) ?? 0) + converted);

    if (
      (occurrence.status === "unpaid" || occurrence.status === "overdue") &&
      isAfter(dueDate, todayDate) &&
      isBefore(dueDate, thirtyDaysOut)
    ) {
      upcomingList.push({
        id: occurrence.id,
        billId: occurrence.billId,
        name: bill?.name ?? "Unknown",
        dueDate: occurrence.dueDate,
        amountCents: converted,
        currency: input.dashboardCurrency,
        status: occurrence.status,
        daysUntilDue: differenceInDays(dueDate, todayDate)
      });
    }
  }

  upcomingList.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

  return {
    summary: {
      monthlyObligationsCents,
      yearlyProjectionCents,
      pendingCount,
      pendingAmountCents,
      overdueCount,
      overdueAmountCents
    },
    categoryTotals: Array.from(categoryTotalsMap.entries())
      .map(([category, amountCents]) => ({ category, amountCents }))
      .sort((a, b) => b.amountCents - a.amountCents),
    monthlyBreakdown: Array.from(monthlyBreakdownMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amountCents]) => ({ month, amountCents })),
    upcoming30Days: upcomingList
  };
}
