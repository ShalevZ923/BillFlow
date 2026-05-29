import Papa from "papaparse";
import { billInputSchema } from "@/lib/billing/validation";
import type { BillInput } from "@/lib/billing/types";

export type CsvPreview = {
  validRows: Array<{ rowNumber: number; bill: BillInput }>;
  errors: Array<{ rowNumber: number; field: string; message: string }>;
  warnings: Array<{ rowNumber: number; message: string }>;
};

export function parseBillCsv(csvText: string): CsvPreview {
  const result = Papa.parse<string[]>(csvText, {
    header: false,
    skipEmptyLines: true
  });

  if (result.data.length < 2) {
    return {
      validRows: [],
      errors: [{ rowNumber: 0, field: "csv", message: "CSV must contain a header row and at least one data row" }],
      warnings: []
    };
  }

  const [headerRow, ...dataRows] = result.data;
  if (!headerRow || headerRow.length < 2) {
    return {
      validRows: [],
      errors: [{ rowNumber: 1, field: "csv", message: "Invalid header row" }],
      warnings: []
    };
  }

  const header = headerRow.map((h) => h.trim().toLowerCase());

  const validRows: CsvPreview["validRows"] = [];
  const errors: CsvPreview["errors"] = [];
  const warnings: CsvPreview["warnings"] = [];
  const seenNames = new Set<string>();

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    if (!row || row.every((c) => !c.trim())) continue;

    const rowNumber = i + 2;
    const record: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      const key = header[j];
      if (key) {
        record[key] = (row[j] ?? "").trim();
      }
    }

    const name = record["name"] ?? "";
    if (seenNames.has(name.toLowerCase())) {
      warnings.push({ rowNumber, message: `Duplicate-looking bill name: "${name}"` });
    }
    if (name) seenNames.add(name.toLowerCase());

    const parsed = billInputSchema.safeParse({
      name: record["name"] ?? "",
      amount: record["amount"] ?? "",
      currency: record["currency"] ?? "USD",
      dueDate: record["duedate"] ?? record["due_date"] ?? "",
      cycle: record["cycle"] ?? record["billingcycle"] ?? "one-time",
      category: record["category"] ?? "Other",
      priority: record["priority"] ?? "medium",
      status: record["status"] ?? "unpaid",
      tags: record["tags"] ?? "",
      notes: record["notes"] ?? ""
    });

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (msgs) {
          errors.push({ rowNumber, field, message: msgs[0] ?? "Invalid" });
        }
      }
      continue;
    }

    validRows.push({ rowNumber, bill: parsed.data });
  }

  return { validRows, errors, warnings };
}

export function generateBillCsv(bills: BillInput[]): string {
  const header = "name,amount,currency,dueDate,cycle,category,priority,status,tags,notes";
  const rows = bills.map((bill) => {
    const amount = (bill.amountCents / 100).toFixed(2);
    const tags = bill.tags.join(", ");
    return `"${bill.name}",${amount},${bill.currency},${bill.dueDate},${bill.cycle},${bill.category},${bill.priority},${bill.status},"${tags}","${bill.notes}"`;
  });

  return [header, ...rows].join("\n");
}
