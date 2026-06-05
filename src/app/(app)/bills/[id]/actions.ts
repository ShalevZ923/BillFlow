"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills, billOccurrences, paymentRecords } from "@/db/schema";
import { eq, desc, inArray, and, gt } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit/log";
import { syncOverdueOccurrences, generateOccurrences } from "@/lib/billing/recurrence";
import { extendOccurrencesIfNeeded } from "@/lib/billing/recurrence";

export type BillDetail = {
  id: string;
  name: string;
  vendor: string;
  amountCents: number;
  currency: string;
  firstDueDate: string;
  cycle: string;
  customCycleDays: number | null;
  category: string;
  priority: string;
  tags: string[];
  notes: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OccurrenceDetail = {
  id: string;
  dueDate: string;
  amountCents: number;
  currency: string;
  status: string;
};

export type PaymentDetail = {
  id: string;
  occurrenceId: string;
  dueDate: string;
  paidAmountCents: number;
  paidCurrency: string;
  paidDate: string;
  method: string;
  note: string;
};

export type BillDetailData = {
  bill: BillDetail;
  occurrences: OccurrenceDetail[];
  payments: PaymentDetail[];
};

export async function getBill(id: string): Promise<BillDetailData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = createDb();

  await syncOverdueOccurrences(db, user.id);
  await extendOccurrencesIfNeeded(db, id, user.id);

  const [bill] = await db
    .select()
    .from(bills)
    .where(eq(bills.id, id))
    .limit(1);

  if (!bill || bill.userId !== user.id) return null;

  const occurrences = await db
    .select()
    .from(billOccurrences)
    .where(eq(billOccurrences.billId, id))
    .orderBy(desc(billOccurrences.dueDate));

  const occurrenceIds = occurrences.map((o) => o.id);

  let paymentsRaw: (typeof paymentRecords.$inferSelect)[] = [];

  if (occurrenceIds.length > 0) {
    paymentsRaw = await db
      .select()
      .from(paymentRecords)
      .where(inArray(paymentRecords.occurrenceId, occurrenceIds))
      .orderBy(desc(paymentRecords.paidDate));
  }

  const occurrenceMap = new Map(occurrences.map((o) => [o.id, o]));

  return {
    bill: {
      id: bill.id,
      name: bill.name,
      vendor: bill.vendor,
      amountCents: bill.amountCents,
      currency: bill.currency,
      firstDueDate: bill.firstDueDate,
      cycle: bill.cycle,
      customCycleDays: bill.customCycleDays,
      category: bill.category,
      priority: bill.priority,
      tags: bill.tags,
      notes: bill.notes,
      active: bill.active,
      createdAt: bill.createdAt.toISOString(),
      updatedAt: bill.updatedAt.toISOString()
    },
    occurrences: occurrences.map((o) => ({
      id: o.id,
      dueDate: o.dueDate,
      amountCents: o.amountCents,
      currency: o.currency,
      status: o.status
    })),
    payments: paymentsRaw.map((p) => {
      const occ = occurrenceMap.get(p.occurrenceId);
      return {
        id: p.id,
        occurrenceId: p.occurrenceId,
        dueDate: occ?.dueDate ?? "",
        paidAmountCents: p.paidAmountCents,
        paidCurrency: p.paidCurrency,
        paidDate: p.paidDate,
        method: p.method,
        note: p.note
      };
    })
  };
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

    await db
      .delete(billOccurrences)
      .where(
        and(
          eq(billOccurrences.billId, id),
          eq(billOccurrences.status, "unpaid"),
          gt(billOccurrences.dueDate, today)
        )
      );

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

    if (newOccurrences.length > 0) {
      await db.insert(billOccurrences).values(newOccurrences).onConflictDoNothing();
    }
  }

  revalidatePath(`/bills/${id}`);
  revalidatePath("/bills");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function updateOccurrenceStatus(
  occurrenceId: string,
  status: "paid" | "unpaid" | "skipped"
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const db = createDb();

  const [occurrence] = await db
    .select()
    .from(billOccurrences)
    .where(eq(billOccurrences.id, occurrenceId))
    .limit(1);

  if (!occurrence || occurrence.userId !== user.id) {
    return { success: false, error: "Occurrence not found" };
  }

  await db
    .update(billOccurrences)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(eq(billOccurrences.id, occurrenceId));

  await logAuditEvent({
    userId: user.id,
    action: "updated_occurrence_status",
    targetType: "occurrence",
    targetId: occurrenceId,
    changes: { before: { status: occurrence.status }, after: { status } }
  });

  revalidatePath(`/bills/${occurrence.billId}`);
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
