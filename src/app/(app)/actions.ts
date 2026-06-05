"use server";

import { redirect } from "next/navigation";
import { and, eq, gte, lt, lte, sql } from "drizzle-orm";
import { format, subDays, addDays } from "date-fns";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills, billOccurrences, paymentRecords } from "@/db/schema";

export type Notification = {
  id: string;
  type: "upcoming" | "overdue" | "paid" | "created";
  message: string;
  billId: string;
  timestamp: string;
};

export async function logoutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function getNotifications(): Promise<Notification[]> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const db = createDb();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = format(today, "yyyy-MM-dd");
  const sevenDaysFromNow = addDays(today, 7);
  const sevenDaysFromNowStr = format(sevenDaysFromNow, "yyyy-MM-dd");
  const sevenDaysAgo = subDays(today, 7);
  const sevenDaysAgoStr = format(sevenDaysAgo, "yyyy-MM-dd");

  const [upcomingRows, overdueRows, paidRows, createdRows] = await Promise.all([
    db
      .select({
        id: billOccurrences.id,
        billId: billOccurrences.billId,
        billName: bills.name,
        dueDate: billOccurrences.dueDate
      })
      .from(billOccurrences)
      .innerJoin(bills, eq(billOccurrences.billId, bills.id))
      .where(
        and(
          eq(billOccurrences.userId, user.id),
          eq(billOccurrences.status, "unpaid"),
          gte(billOccurrences.dueDate, todayStr),
          lte(billOccurrences.dueDate, sevenDaysFromNowStr)
        )
      ),
    db
      .select({
        id: billOccurrences.id,
        billId: billOccurrences.billId,
        billName: bills.name,
        dueDate: billOccurrences.dueDate
      })
      .from(billOccurrences)
      .innerJoin(bills, eq(billOccurrences.billId, bills.id))
      .where(
        and(
          eq(billOccurrences.userId, user.id),
          eq(billOccurrences.status, "unpaid"),
          lt(billOccurrences.dueDate, todayStr)
        )
      ),
    db
      .select({
        id: paymentRecords.id,
        billId: billOccurrences.billId,
        billName: bills.name,
        paidDate: paymentRecords.paidDate,
        paidAt: paymentRecords.createdAt
      })
      .from(paymentRecords)
      .innerJoin(billOccurrences, eq(paymentRecords.occurrenceId, billOccurrences.id))
      .innerJoin(bills, eq(billOccurrences.billId, bills.id))
      .where(
        and(
          eq(paymentRecords.userId, user.id),
          gte(paymentRecords.paidDate, sevenDaysAgoStr)
        )
      ),
    db
      .select({
        id: bills.id,
        name: bills.name,
        createdAt: bills.createdAt
      })
      .from(bills)
      .where(
        and(
          eq(bills.userId, user.id),
          gte(bills.createdAt, sql`${sevenDaysAgoStr}::date`)
        )
      )
  ]);

  const results: Notification[] = [];

  for (const row of overdueRows) {
    results.push({
      id: `overdue-${row.id}`,
      type: "overdue",
      message: `${row.billName} is overdue`,
      billId: row.billId,
      timestamp: row.dueDate
    });
  }

  for (const row of upcomingRows) {
    results.push({
      id: `upcoming-${row.id}`,
      type: "upcoming",
      message: `${row.billName} is due soon`,
      billId: row.billId,
      timestamp: row.dueDate
    });
  }

  for (const row of paidRows) {
    results.push({
      id: `paid-${row.id}`,
      type: "paid",
      message: `${row.billName} bill paid`,
      billId: row.billId,
      timestamp: row.paidDate
    });
  }

  for (const row of createdRows) {
    results.push({
      id: `created-${row.id}`,
      type: "created",
      message: `${row.name} added`,
      billId: row.id,
      timestamp: row.createdAt.toISOString()
    });
  }

  results.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return results;
}
