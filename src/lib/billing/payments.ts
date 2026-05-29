import { z } from "zod";
import { occurrenceStatuses } from "./types";

function parseAmountToCents(value: string): number {
  const [whole, decimal = ""] = value.trim().split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

export const paymentRecordSchema = z
  .object({
    occurrenceId: z.string().uuid(),
    paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    paidCurrency: z.string().length(3),
    paidDate: z.string().date(),
    method: z.enum(["card", "bank", "cash", "transfer", "other"]),
    note: z.string().max(1000).default("")
  })
  .transform((value) => ({
    ...value,
    paidAmountCents: parseAmountToCents(value.paidAmount),
    paidAmount: undefined
  }));

export function applyPaymentToOccurrence<T extends { id: string; status: (typeof occurrenceStatuses)[number] }>(occurrence: T): T {
  return { ...occurrence, status: "paid" };
}
