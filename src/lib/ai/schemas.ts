import { z } from "zod";
import { supportedCurrencies, billingCycles, billPriorities } from "@/lib/billing/types";

export const aiFillResponseSchema = z.object({
  name: z.string().min(1).max(120),
  amount: z.string(),
  currency: z.enum(supportedCurrencies),
  dueDate: z.string(),
  cycle: z.enum(billingCycles),
  category: z.string().min(1),
  priority: z.enum(billPriorities),
  tags: z.array(z.string()),
  notes: z.string().max(2000)
});

export type AiFillResponse = z.infer<typeof aiFillResponseSchema>;

export const dailyInsightResponseSchema = z.object({
  summary: z.string(),
  suggestions: z.array(z.string()),
  riskLevel: z.enum(["low", "medium", "high"])
});

export type DailyInsightResponse = z.infer<typeof dailyInsightResponseSchema>;
