"use server";

import { createDb } from "@/db/client";
import { exchangeRateSnapshots } from "@/db/schema";
import { eq } from "drizzle-orm";

export type ExchangeRateData = {
  base: string;
  rates: Record<string, number>;
  updatedAt: string;
};

export async function getExchangeRates(): Promise<ExchangeRateData | null> {
  try {
    const db = createDb();
    const [snapshot] = await db
      .select()
      .from(exchangeRateSnapshots)
      .where(eq(exchangeRateSnapshots.id, "global"));

    if (!snapshot) return null;

    return {
      base: snapshot.base,
      rates: snapshot.rates as Record<string, number>,
      updatedAt: snapshot.updatedAt.toISOString()
    };
  } catch {
    return null;
  }
}
