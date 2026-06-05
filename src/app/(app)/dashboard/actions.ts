"use server";

import { eq } from "drizzle-orm";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills, billOccurrences, paymentRecords, exchangeRateSnapshots, profiles } from "@/db/schema";
import type { CurrencyCode } from "@/lib/billing/types";
import type { ExchangeRates } from "@/lib/currency/conversion";

export type DashboardBillData = {
  id: string;
  name: string;
  vendor: string;
  category: string;
  priority: string;
  tags: string[];
  cycle: string;
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
  };
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  const db = createDb();

  const [userBills, userOccurrences, userPayments, [rateSnapshot], [profile]] =
    await Promise.all([
      db.select().from(bills).where(eq(bills.userId, user.id)),
      db.select().from(billOccurrences).where(eq(billOccurrences.userId, user.id)),
      db.select().from(paymentRecords).where(eq(paymentRecords.userId, user.id)),
      db
        .select()
        .from(exchangeRateSnapshots)
        .where(eq(exchangeRateSnapshots.id, "global"))
        .limit(1),
      db
        .select()
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
      cycle: b.cycle
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
      defaultCurrency: (profile?.defaultCurrency ?? "USD") as CurrencyCode
    }
  };
}
