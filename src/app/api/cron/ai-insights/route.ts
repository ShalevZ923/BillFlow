import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { createDb } from "@/db/client";
import { profiles, aiInsights, bills, billOccurrences } from "@/db/schema";
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

    const today = new Date().toISOString().slice(0, 10);

    for (const user of proUsers) {
      try {
        const userBills = await db
          .select()
          .from(bills)
          .where(eq(bills.userId, user.id));

        const userOccurrences = await db
          .select()
          .from(billOccurrences)
          .where(eq(billOccurrences.userId, user.id));

        const totalBills = userBills.length;

        const overdueOccurrences = userOccurrences.filter(
          (o) => o.status === "overdue" || (o.status === "unpaid" && o.dueDate < today)
        );
        const overdueCount = overdueOccurrences.length;
        const overdueAmount = overdueOccurrences.reduce((sum, o) => sum + o.amountCents, 0);

        const pendingOccurrences = userOccurrences.filter(
          (o) => o.status === "unpaid" && o.dueDate >= today
        );
        const pendingCount = pendingOccurrences.length;
        const pendingAmount = pendingOccurrences.reduce((sum, o) => sum + o.amountCents, 0);

        const categoryMap = new Map<string, number>();
        for (const o of userOccurrences) {
          const bill = userBills.find((b) => b.id === o.billId);
          const cat = bill?.category ?? "Other";
          categoryMap.set(cat, (categoryMap.get(cat) ?? 0) + o.amountCents);
        }
        const categories = Array.from(categoryMap.entries()).map(([category, amount]) => ({
          category,
          amount: amount / 100
        }));

        const monthlyTotal = userOccurrences
          .filter((o) => o.status !== "skipped" && o.status !== "paid")
          .reduce((sum, o) => sum + o.amountCents, 0) / 100;

        const summary = {
          totalBills,
          overdueCount,
          overdueAmount: overdueAmount / 100,
          pendingCount,
          pendingAmount: pendingAmount / 100,
          categories,
          monthlyTotal
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
    console.error("AI insights cron failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
