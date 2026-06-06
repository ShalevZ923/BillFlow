"use server";

import { eq, sql, and, gte } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills, billOccurrences, paymentRecords, exchangeRateSnapshots, profiles } from "@/db/schema";
import type { CurrencyCode } from "@/lib/billing/types";
import type { ExchangeRates } from "@/lib/currency/conversion";
import { syncOverdueOccurrences } from "@/lib/billing/recurrence";

const DASHBOARD_MONTHS = 30;

export type DashboardBillData = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  priority: string;
  tags: string[];
  cycle: string;
  notes: string;
};

export type DashboardOccurrenceData = {
  id: string;
  billId: string;
  dueDate: string;
  amountCents: number;
  currency: CurrencyCode;
  status: string;
};

export type DashboardPaymentData = {
  id: string;
  occurrenceId: string;
  paidAmountCents: number;
  paidCurrency: string;
  paidDate: string;
  method: string;
  note: string;
};

export type DashboardData = {
  bills: DashboardBillData[];
  occurrences: DashboardOccurrenceData[];
  payments: DashboardPaymentData[];
  rates: ExchangeRates | null;
  userProfile: {
    name: string;
    email: string;
    defaultCurrency: CurrencyCode;
    onboardingCompleted: boolean;
  };
};

export async function getDashboardData(search?: string): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const db = createDb();

  await syncOverdueOccurrences(db, user.id);

  const searchPattern = search?.trim() ? `%${search.trim()}%` : null;

  const billsWhere = searchPattern
    ? sql`${bills.userId} = ${user.id} AND (${bills.name} ILIKE ${searchPattern} OR ${bills.vendor} ILIKE ${searchPattern} OR ${bills.notes} ILIKE ${searchPattern} OR ${bills.category} ILIKE ${searchPattern})`
    : eq(bills.userId, user.id);

  const cutoffDate = new Date();
  cutoffDate.setMonth(cutoffDate.getMonth() - DASHBOARD_MONTHS);
  const cutoffStr = cutoffDate.toISOString().slice(0, 10);

  const occurrencesWhere = sql`${billOccurrences.userId} = ${user.id} AND ${billOccurrences.dueDate} >= ${cutoffStr}::date`;

  const [userBills, userOccurrences, userPayments, [rateSnapshot], [profile]] =
    await Promise.all([
      db
        .select({
          id: bills.id,
          name: bills.name,
          vendor: bills.vendor,
          category: bills.category,
          priority: bills.priority,
          tags: bills.tags,
          cycle: bills.cycle,
          notes: bills.notes
        })
        .from(bills)
        .where(billsWhere),
      db
        .select({
          id: billOccurrences.id,
          billId: billOccurrences.billId,
          dueDate: billOccurrences.dueDate,
          amountCents: billOccurrences.amountCents,
          currency: billOccurrences.currency,
          status: billOccurrences.status
        })
        .from(billOccurrences)
        .where(occurrencesWhere),
      db
        .select({
          id: paymentRecords.id,
          occurrenceId: paymentRecords.occurrenceId,
          paidAmountCents: paymentRecords.paidAmountCents,
          paidCurrency: paymentRecords.paidCurrency,
          paidDate: paymentRecords.paidDate,
          method: paymentRecords.method,
          note: paymentRecords.note
        })
        .from(paymentRecords)
        .where(eq(paymentRecords.userId, user.id)),
      db
        .select({
          base: exchangeRateSnapshots.base,
          rates: exchangeRateSnapshots.rates,
          updatedAt: exchangeRateSnapshots.updatedAt
        })
        .from(exchangeRateSnapshots)
        .where(eq(exchangeRateSnapshots.id, "global"))
        .limit(1),
      db
        .select({
          name: profiles.name,
          defaultCurrency: profiles.defaultCurrency,
          onboardingCompletedAt: profiles.onboardingCompletedAt
        })
        .from(profiles)
        .where(eq(profiles.id, user.id))
        .limit(1)
    ]);

  const rates: ExchangeRates | null = rateSnapshot
    ? {
        base: rateSnapshot.base,
        updatedAt: rateSnapshot.updatedAt.toISOString(),
        rates: rateSnapshot.rates
      }
    : null;

  return {
    bills: userBills.map((b) => ({
      id: b.id,
      name: b.name,
      vendor: b.vendor,
      category: b.category,
      priority: b.priority,
      tags: b.tags,
      cycle: b.cycle,
      notes: b.notes
    })),
    occurrences: userOccurrences.map((o) => ({
      id: o.id,
      billId: o.billId,
      dueDate: o.dueDate,
      amountCents: o.amountCents,
      currency: o.currency as CurrencyCode,
      status: o.status
    })),
    payments: userPayments.map((p) => ({
      id: p.id,
      occurrenceId: p.occurrenceId,
      paidAmountCents: p.paidAmountCents,
      paidCurrency: p.paidCurrency,
      paidDate: p.paidDate,
      method: p.method,
      note: p.note
    })),
    rates,
    userProfile: {
      name: profile?.name ?? "User",
      email: user.email ?? "",
      defaultCurrency: (profile?.defaultCurrency ?? "USD") as CurrencyCode,
      onboardingCompleted: !!profile?.onboardingCompletedAt
    }
  };
}
