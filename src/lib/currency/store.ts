import { eq } from "drizzle-orm";
import { exchangeRateSnapshots } from "@/db/schema";
import type { createDb } from "@/db/client";
import type { ExchangeRates } from "./conversion";
import type { ExchangeRateStore } from "./rates";

const globalSnapshotId = "global";

export function createExchangeRateStore(db: ReturnType<typeof createDb>): ExchangeRateStore {
  return {
    async getLatest() {
      const [snapshot] = await db
        .select()
        .from(exchangeRateSnapshots)
        .where(eq(exchangeRateSnapshots.id, globalSnapshotId))
        .limit(1);

      if (!snapshot) return null;

      return {
        base: snapshot.base,
        updatedAt: snapshot.updatedAt.toISOString(),
        rates: snapshot.rates
      };
    },
    async saveLatest(rates: ExchangeRates) {
      const updatedAt = new Date(rates.updatedAt);

      await db
        .insert(exchangeRateSnapshots)
        .values({
          id: globalSnapshotId,
          base: rates.base,
          rates: rates.rates,
          updatedAt
        })
        .onConflictDoUpdate({
          target: exchangeRateSnapshots.id,
          set: {
            base: rates.base,
            rates: rates.rates,
            updatedAt
          }
        });
    }
  };
}
