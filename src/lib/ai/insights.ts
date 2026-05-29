import { generateStructuredResponse } from "./client";
import { dailyInsightResponseSchema } from "./schemas";
import type { DailyInsightResponse } from "./schemas";

type DashboardSummary = {
  totalBills: number;
  overdueCount: number;
  overdueAmount: number;
  pendingCount: number;
  pendingAmount: number;
  categories: Array<{ category: string; amount: number }>;
  monthlyTotal: number;
};

export async function generateDailyInsight(
  summary: DashboardSummary
): Promise<DailyInsightResponse> {
  const system =
    "You analyze bill payment data and provide concise financial insights. " +
    "Focus on patterns, risks, and actionable suggestions. Keep summaries under 3 sentences. " +
    "Provide 2-4 specific suggestions.";

  const user = JSON.stringify(summary);

  return generateStructuredResponse({
    system,
    user,
    schema: dailyInsightResponseSchema
  });
}
