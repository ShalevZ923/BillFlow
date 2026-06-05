import { addDays, addMonths, addYears, format, isBefore, parseISO } from "date-fns";
import { eq, and, lt, gt, sql } from "drizzle-orm";
import type { BillingCycle, OccurrenceStatus } from "./types";
import type { createDb } from "@/db/client";
import { billOccurrences } from "@/db/schema";

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

export async function syncOverdueOccurrences(db: ReturnType<typeof createDb>, userId: string) {
  const todayStr = format(new Date(), "yyyy-MM-dd");

  await db
    .update(billOccurrences)
    .set({ status: "overdue", updatedAt: new Date() })
    .where(
      and(
        eq(billOccurrences.userId, userId),
        eq(billOccurrences.status, "unpaid"),
        lt(billOccurrences.dueDate, todayStr)
      )
    );
}

export async function extendOccurrencesIfNeeded(db: ReturnType<typeof createDb>, billId: string, userId: string) {
  const { bills } = await import("@/db/schema");

  const [bill] = await db
    .select({ cycle: bills.cycle, customCycleDays: bills.customCycleDays, amountCents: bills.amountCents, currency: bills.currency })
    .from(bills)
    .where(and(eq(bills.id, billId), eq(bills.userId, userId)))
    .limit(1);

  if (!bill || bill.cycle === "one-time") return;

  const todayStr = format(new Date(), "yyyy-MM-dd");

  const futureOccurrences = await db
    .select({ count: sql<number>`count(*)` })
    .from(billOccurrences)
    .where(
      and(
        eq(billOccurrences.billId, billId),
        eq(billOccurrences.status, "unpaid"),
        gt(billOccurrences.dueDate, todayStr)
      )
    );

  const remaining = futureOccurrences[0]?.count ?? 0;

  if (remaining > 2) return;

  const latestOccurrence = await db
    .select({ dueDate: billOccurrences.dueDate })
    .from(billOccurrences)
    .where(eq(billOccurrences.billId, billId))
    .orderBy(sql`${billOccurrences.dueDate} DESC`)
    .limit(1);

  const startDate = latestOccurrence[0]?.dueDate ?? todayStr;

  const newOccurrences = generateOccurrences({
    billId,
    userId,
    startDate,
    cycle: bill.cycle,
    customCycleDays: bill.customCycleDays,
    amountCents: bill.amountCents,
    currency: bill.currency,
    monthsAhead: 12
  });

  const futureDateStr = newOccurrences
    .filter((o) => o.dueDate > startDate)
    .map((o) => ({
      billId: o.billId,
      userId: o.userId,
      dueDate: o.dueDate,
      amountCents: o.amountCents,
      currency: o.currency,
      status: o.status
    }));

  if (futureDateStr.length > 0) {
    await db.insert(billOccurrences).values(futureDateStr).onConflictDoNothing();
  }
}
