import { addDays, addMonths, addYears, format, isBefore, parseISO } from "date-fns";
import type { BillingCycle, OccurrenceStatus } from "./types";

export type GeneratedOccurrence = {
  billId: string;
  userId: string;
  dueDate: string;
  amountCents: number;
  currency: string;
  status: "unpaid";
};

export function generateOccurrences(input: {
  billId: string;
  userId: string;
  startDate: string;
  cycle: BillingCycle;
  customCycleDays?: number | null;
  amountCents: number;
  currency: string;
  monthsAhead: number;
}): GeneratedOccurrence[] {
  const count = input.cycle === "one-time" ? 1 : input.monthsAhead;
  const firstDate = parseISO(input.startDate);

  return Array.from({ length: count }, (_, index) => {
    let dueDate = firstDate;
    if (input.cycle === "monthly") dueDate = addMonths(firstDate, index);
    if (input.cycle === "yearly") dueDate = addYears(firstDate, index);
    if (input.cycle === "custom") dueDate = addDays(firstDate, index * (input.customCycleDays ?? 30));

    return {
      billId: input.billId,
      userId: input.userId,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      amountCents: input.amountCents,
      currency: input.currency,
      status: "unpaid"
    };
  });
}

export function markOverdue<T extends { dueDate: string; status: OccurrenceStatus }>(occurrences: T[], today: string): T[] {
  const todayDate = parseISO(today);

  return occurrences.map((occurrence) => {
    if (occurrence.status === "unpaid" && isBefore(parseISO(occurrence.dueDate), todayDate)) {
      return { ...occurrence, status: "overdue" };
    }

    return occurrence;
  });
}
