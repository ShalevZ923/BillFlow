import { z } from "zod";
import { billPriorities, billingCycles, supportedCurrencies } from "./types";

function parseAmountToCents(value: string): number {
  const normalized = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Amount must be a positive number with up to 2 decimals");
  }

  const [whole, decimal = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export const billInputSchema = z
  .object({
    name: z.string().trim().min(1, "Bill name is required").max(120),
    amount: z.string().transform((value, ctx) => {
      try {
        const cents = parseAmountToCents(value);
        if (cents <= 0) {
          ctx.addIssue({ code: "custom", message: "Amount must be greater than 0" });
          return z.NEVER;
        }
        return cents;
      } catch (error) {
        ctx.addIssue({ code: "custom", message: error instanceof Error ? error.message : "Invalid amount" });
        return z.NEVER;
      }
    }),
    currency: z.enum(supportedCurrencies),
    dueDate: z.string().date(),
    cycle: z.enum(billingCycles),
    category: z.string().trim().min(1).default("Other"),
    priority: z.enum(billPriorities),
    status: z.enum(["unpaid", "paid", "skipped"]),
    tags: z.string().default("").transform(parseTags),
    notes: z.string().max(2000).default("")
  })
  .transform((value) => ({
    ...value,
    amountCents: value.amount,
    amount: undefined
  }));
