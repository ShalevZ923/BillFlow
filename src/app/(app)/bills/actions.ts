"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills, billOccurrences } from "@/db/schema";
import { eq, inArray, desc, asc, sql } from "drizzle-orm";
import { syncOverdueOccurrences } from "@/lib/billing/recurrence";

export type BillData = {
  id: string;
  name: string;
  vendor: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  cycle: string;
  category: string;
  priority: string;
  status: string;
  tags: string[];
  notes: string;
};

export async function getBills(search?: string): Promise<BillData[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const db = createDb();

  await syncOverdueOccurrences(db, user.id);

  const searchPattern = search?.trim() ? `%${search.trim()}%` : null;

  const userBills = await db
    .select()
    .from(bills)
    .where(
      searchPattern
        ? sql`${bills.userId} = ${user.id} AND (${bills.name} ILIKE ${searchPattern} OR ${bills.vendor} ILIKE ${searchPattern} OR ${bills.notes} ILIKE ${searchPattern} OR ${bills.category} ILIKE ${searchPattern})`
        : eq(bills.userId, user.id)
    )
    .orderBy(desc(bills.createdAt));

  const billIds = userBills.map((b) => b.id);

  const occurrenceMap = new Map<string, typeof billOccurrences.$inferSelect>();

  if (billIds.length > 0) {
    const occurrences = await db
      .select()
      .from(billOccurrences)
      .where(inArray(billOccurrences.billId, billIds))
      .orderBy(asc(billOccurrences.dueDate));

    for (const occ of occurrences) {
      if (!occurrenceMap.has(occ.billId)) {
        occurrenceMap.set(occ.billId, occ);
      }
    }
  }

  return userBills.map((bill) => {
    const occ = occurrenceMap.get(bill.id);
    let status = "unpaid";
    if (occ) {
      if (occ.status === "paid") status = "paid";
      else if (occ.status === "skipped") status = "skipped";
      else {
        const due = new Date(occ.dueDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        due.setHours(0, 0, 0, 0);
        status = due < today ? "overdue" : "unpaid";
      }
    }

    return {
      id: bill.id,
      name: bill.name,
      vendor: bill.vendor,
      amountCents: bill.amountCents,
      currency: bill.currency,
      dueDate: bill.firstDueDate,
      cycle: bill.cycle,
      category: bill.category,
      priority: bill.priority,
      status,
      tags: bill.tags,
      notes: bill.notes
    };
  });
}
