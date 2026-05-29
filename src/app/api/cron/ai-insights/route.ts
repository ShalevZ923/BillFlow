import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createDb } from "@/db/client";
import { profiles, aiInsights } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateDailyInsight } from "@/lib/ai/insights";

export async function GET(request: Request) {
  try {
    const env = getEnv();

    const authHeader = request.headers.get("Authorization");
    const expected = `Bearer ${env.CRON_SECRET}`;

    if (!env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();

    const proUsers = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.plan, "pro"));

    let generated = 0;
    let failed = 0;

    for (const user of proUsers) {
      try {
        const summary = {
          totalBills: 5,
          overdueCount: 1,
          overdueAmount: 8400,
          pendingCount: 2,
          pendingAmount: 292050,
          categories: [
            { category: "Rent", amount: 2800 },
            { category: "SaaS", amount: 144 }
          ],
          monthlyTotal: 2920
        };

        const insight = await generateDailyInsight(summary);

        await db.insert(aiInsights).values({
          userId: user.id,
          summary: insight.summary,
          suggestions: insight.suggestions
        });

        generated++;
      } catch {
        failed++;
      }
    }

    return NextResponse.json({ generated, failed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
