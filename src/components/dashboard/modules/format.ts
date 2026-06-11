import { format, parseISO } from "date-fns";
import { currencyOptions } from "@/lib/currency/supported";

export function formatDashboardCurrency(cents: number, currency: string): string {
  const symbol = currencyOptions.find((option) => option.code === currency)?.symbol ?? currency;
  return `${symbol}${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

export function formatDashboardDate(date: string): string {
  return format(parseISO(date), "MMM d");
}

export function formatDueDistance(daysUntilDue: number): string {
  if (daysUntilDue < 0) return `${Math.abs(daysUntilDue)}d overdue`;
  if (daysUntilDue === 0) return "Due today";
  if (daysUntilDue === 1) return "Due tomorrow";
  return `Due in ${daysUntilDue}d`;
}
