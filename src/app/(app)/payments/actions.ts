"use server";

import { eq, inArray } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { paymentRecords, billOccurrences, bills } from "@/db/schema";

export type PaymentRecordData = {
  id: string;
  billName: string;
  category: string;
  paidAmountCents: number;
  paidCurrency: string;
  paidDate: string;
  method: string;
  note: string;
  status: string;
};

export type OccurrenceOption = {
  id: string;
  billName: string;
  category: string;
  dueDate: string;
  amountCents: number;
  currency: string;
  status: string;
};

function requireUser() {
  return createSupabaseServerClient().then(async (supabase) => {
    const {
      data: { user }
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");
    return user;
  });
}

export async function getPayments(): Promise<PaymentRecordData[]> {
  const user = await requireUser();
  const db = createDb();

  const userPayments = await db
    .select()
    .from(paymentRecords)
    .where(eq(paymentRecords.userId, user.id));

  if (userPayments.length === 0) return [];

  const occurrenceIds = userPayments.map((p) => p.occurrenceId);
  const occurrences = await db
    .select()
    .from(billOccurrences)
    .where(inArray(billOccurrences.id, occurrenceIds));

  const billIds = occurrences.map((o) => o.billId);
  const billRecords = await db
    .select()
    .from(bills)
    .where(inArray(bills.id, billIds));

  const billsById = new Map(billRecords.map((b) => [b.id, b]));
  const occurrencesById = new Map(occurrences.map((o) => [o.id, o]));

  return userPayments.map((p) => {
    const occurrence = occurrencesById.get(p.occurrenceId);
    const bill = occurrence ? billsById.get(occurrence.billId) : undefined;
    return {
      id: p.id,
      billName: bill?.name ?? "Unknown Bill",
      category: bill?.category ?? "Other",
      paidAmountCents: p.paidAmountCents,
      paidCurrency: p.paidCurrency,
      paidDate: p.paidDate,
      method: p.method,
      note: p.note,
      status: occurrence?.status ?? "paid"
    };
  });
}

export async function getUnpaidOccurrences(): Promise<OccurrenceOption[]> {
  const user = await requireUser();
  const db = createDb();

  const occurrences = await db
    .select()
    .from(billOccurrences)
    .where(eq(billOccurrences.userId, user.id));

  const unpaid = occurrences.filter(
    (o) => o.status === "unpaid" || o.status === "overdue"
  );

  if (unpaid.length === 0) return [];

  const billIds = [...new Set(unpaid.map((o) => o.billId))];
  const billRecords = await db
    .select()
    .from(bills)
    .where(inArray(bills.id, billIds));

  const billsById = new Map(billRecords.map((b) => [b.id, b]));

  return unpaid
    .map((o) => {
      const bill = billsById.get(o.billId);
      return {
        id: o.id,
        billName: bill?.name ?? "Unknown Bill",
        category: bill?.category ?? "Other",
        dueDate: o.dueDate,
        amountCents: o.amountCents,
        currency: o.currency,
        status: o.status
      };
    })
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
}
