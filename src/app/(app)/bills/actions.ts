"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills, billOccurrences } from "@/db/schema";
import { eq, inArray, desc, asc, sql, and, gt } from "drizzle-orm";
import { generateOccurrences, syncOverdueOccurrences } from "@/lib/billing/recurrence";
import { deriveBillStatus, selectPrimaryOccurrence } from "@/lib/billing/status";
import { logAuditEvent } from "@/lib/audit/log";

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

  const occurrenceMap = new Map<string, (typeof billOccurrences.$inferSelect)[]>();

  if (billIds.length > 0) {
    const occurrences = await db
      .select()
      .from(billOccurrences)
      .where(inArray(billOccurrences.billId, billIds))
      .orderBy(asc(billOccurrences.dueDate));

    for (const occ of occurrences) {
      const billOccurrencesForBill = occurrenceMap.get(occ.billId) ?? [];
      billOccurrencesForBill.push(occ);
      occurrenceMap.set(occ.billId, billOccurrencesForBill);
    }
  }

  const today = new Date().toISOString().slice(0, 10);

  return userBills.map((bill) => {
    const occurrences = occurrenceMap.get(bill.id) ?? [];
    const primaryOccurrence = selectPrimaryOccurrence(occurrences, today);
    const status = deriveBillStatus(occurrences, today);

    return {
      id: bill.id,
      name: bill.name,
      vendor: bill.vendor,
      amountCents: primaryOccurrence?.amountCents ?? bill.amountCents,
      currency: primaryOccurrence?.currency ?? bill.currency,
      dueDate: primaryOccurrence?.dueDate ?? bill.firstDueDate,
      cycle: bill.cycle,
      category: bill.category,
      priority: bill.priority,
      status,
      tags: bill.tags,
      notes: bill.notes
    };
  });
}

function parseAmountToCents(value: string): number {
  const normalized = value.trim();
  const [whole, decimal = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

export async function updateBill(
  id: string,
  data: {
    name: string;
    vendor: string;
    amount: string;
    currency: string;
    dueDate: string;
    cycle: string;
    customCycleDays?: string;
    category: string;
    priority: string;
    tags: string;
    notes: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const db = createDb();

  const [existing] = await db
    .select()
    .from(bills)
    .where(eq(bills.id, id))
    .limit(1);

  if (!existing || existing.userId !== user.id) {
    return { success: false, error: "Bill not found" };
  }

  const amountCents = parseAmountToCents(data.amount);
  if (amountCents <= 0) {
    return { success: false, error: "Amount must be greater than 0" };
  }

  const before = {
    name: existing.name,
    vendor: existing.vendor,
    amountCents: existing.amountCents,
    currency: existing.currency,
    firstDueDate: existing.firstDueDate,
    cycle: existing.cycle,
    category: existing.category,
    priority: existing.priority,
    tags: existing.tags,
    notes: existing.notes
  };

  await db
    .update(bills)
    .set({
      name: data.name,
      vendor: data.vendor,
      amountCents,
      currency: data.currency,
      firstDueDate: data.dueDate,
      cycle: data.cycle as typeof existing.cycle,
      customCycleDays:
        data.cycle === "custom" ? parseInt(data.customCycleDays || "0") || null : null,
      category: data.category,
      priority: data.priority as typeof existing.priority,
      tags: data.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      notes: data.notes,
      updatedAt: new Date()
    })
    .where(eq(bills.id, id));

  const after = {
    name: data.name,
    vendor: data.vendor,
    amountCents,
    currency: data.currency,
    firstDueDate: data.dueDate,
    cycle: data.cycle,
    category: data.category,
    priority: data.priority,
    tags: data.tags.split(",").map((t) => t.trim()).filter(Boolean),
    notes: data.notes
  };

  await logAuditEvent({
    userId: user.id,
    action: "updated_bill",
    targetType: "bill",
    targetId: id,
    changes: { before, after }
  });

  const amountChanged = amountCents !== existing.amountCents;
  const cycleChanged = data.cycle !== existing.cycle;
  const dueDateChanged = data.dueDate !== existing.firstDueDate;

  if (amountChanged || cycleChanged || dueDateChanged) {
    const today = new Date().toISOString().slice(0, 10);

    const newOccurrences = generateOccurrences({
      billId: id,
      userId: user.id,
      startDate: data.dueDate,
      cycle: data.cycle as typeof existing.cycle,
      customCycleDays: data.cycle === "custom" ? parseInt(data.customCycleDays || "0") || null : null,
      amountCents,
      currency: data.currency,
      monthsAhead: 12
    });

    await db.transaction(async (tx) => {
      await tx
        .delete(billOccurrences)
        .where(
          and(
            eq(billOccurrences.billId, id),
            eq(billOccurrences.status, "unpaid"),
            gt(billOccurrences.dueDate, today)
          )
        );

      if (newOccurrences.length > 0) {
        await tx.insert(billOccurrences).values(newOccurrences).onConflictDoNothing();
      }
    });
  }

  revalidatePath("/bills");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteBill(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const db = createDb();

  const [existing] = await db
    .select()
    .from(bills)
    .where(eq(bills.id, id))
    .limit(1);

  if (!existing || existing.userId !== user.id) {
    return { success: false, error: "Bill not found" };
  }

  await db.delete(bills).where(eq(bills.id, id));

  await logAuditEvent({
    userId: user.id,
    action: "deleted_bill",
    targetType: "bill",
    targetId: id
  });

  revalidatePath("/bills");
  revalidatePath("/dashboard");

  return { success: true };
}
