import { generateBillCsv } from "@/lib/csv/import";
import type { BillInput } from "@/lib/billing/types";

export function exportBillsToCsv(bills: BillInput[]): string {
  return generateBillCsv(bills);
}
