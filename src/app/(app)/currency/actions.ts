"use server";

import { createDb } from "@/db/client";
import { exchangeRateSnapshots } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getEnv } from "@/lib/env";
import type { CurrencyCode } from "@/lib/billing/types";

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

export async function refreshExchangeRates(): Promise<ExchangeRateData | null> {
  try {
    const env = getEnv();
    const response = await fetch(env.EXCHANGE_RATE_API_URL);

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as {
      base: string;
      rates: Record<string, number>;
    };

    const supportedCodes: CurrencyCode[] = ["USD", "EUR", "GBP", "ILS"];
    const base = (supportedCodes.includes(data.base as CurrencyCode) ? data.base : "USD") as CurrencyCode;
    const rates: Record<string, number> = {};

    for (const code of supportedCodes) {
      if (data.rates[code] !== undefined) {
        rates[code] = data.rates[code];
      }
    }

    if (Object.keys(rates).length === 0) {
      return null;
    }

    const db = createDb();
    const now = new Date();

    await db
      .insert(exchangeRateSnapshots)
      .values({ base, rates, updatedAt: now })
      .onConflictDoUpdate({
        target: exchangeRateSnapshots.id,
        set: { base, rates, updatedAt: now }
      });

    return {
      base,
      rates,
      updatedAt: now.toISOString()
    };
  } catch {
    return null;
  }
}
