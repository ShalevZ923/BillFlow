import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createDb } from "@/db/client";
import { exchangeRateSnapshots } from "@/db/schema";
import type { CurrencyCode } from "@/lib/billing/types";

export async function GET(request: Request) {
  try {
    const env = getEnv();

    const authHeader = request.headers.get("Authorization");
    const expected = `Bearer ${env.CRON_SECRET}`;

    if (!env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const apiUrl = env.EXCHANGE_RATE_API_URL;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch exchange rates" },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      result?: string;
      base_code?: string;
      base?: string;
      date: string;
      rates: Record<string, number>;
    };

    const ratesBase = data.base_code ?? data.base ?? "USD";

    const supportedCodes: CurrencyCode[] = ["USD", "EUR", "GBP", "ILS"];
    const base = (supportedCodes.includes(ratesBase as CurrencyCode) ? ratesBase : "USD") as CurrencyCode;
    const filteredRates: Record<CurrencyCode, number> = {} as Record<CurrencyCode, number>;
    for (const code of supportedCodes) {
      if (data.rates[code] === undefined) {
        return NextResponse.json(
          { error: `Exchange rates response did not include ${code}` },
          { status: 502 }
        );
      }
      filteredRates[code] = data.rates[code];
    }

    const db = createDb();

    await db
      .insert(exchangeRateSnapshots)
      .values({ base, rates: filteredRates, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: exchangeRateSnapshots.id,
        set: { base, rates: filteredRates, updatedAt: new Date() }
      });

    return NextResponse.json({ refreshed: true, updatedAt: new Date().toISOString() });
  } catch (error) {
    console.error("Exchange rates cron failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
