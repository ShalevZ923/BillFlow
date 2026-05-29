import { describe, expect, it } from "vitest";
import { parseBillCsv, generateBillCsv } from "@/lib/csv/import";
import { exportBillsToCsv } from "@/lib/csv/export";
import type { BillInput } from "@/lib/billing/types";

describe("CSV import", () => {
  const validCsv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
AWS Invoice,120.50,USD,2026-06-15,monthly,Cloud,medium,unpaid,"cloud, infrastructure",Production account`;

  it("parses valid CSV into preview rows", () => {
    const result = parseBillCsv(validCsv);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]?.bill.name).toBe("AWS Invoice");
    expect(result.validRows[0]?.bill.amountCents).toBe(12050);
    expect(result.validRows[0]?.bill.tags).toEqual(["cloud", "infrastructure"]);
  });

  it("detects invalid amount", () => {
    const badCsv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
Bad Amount,abc,USD,2026-06-15,monthly,Cloud,medium,unpaid,,`;
    const result = parseBillCsv(badCsv);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validRows).toHaveLength(0);
  });

  it("warns on duplicate-looking names", () => {
    const dupCsv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
Test,100.00,USD,2026-06-15,monthly,Other,low,unpaid,,
Test,200.00,USD,2026-07-15,monthly,Other,low,unpaid,,`;
    const result = parseBillCsv(dupCsv);
    expect(result.warnings.length).toBe(1);
    expect(result.validRows).toHaveLength(2);
  });

  it("handles empty CSV gracefully", () => {
    const result = parseBillCsv("");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.validRows).toHaveLength(0);
  });
});

describe("CSV export", () => {
  const bills: BillInput[] = [
    {
      name: "AWS Invoice",
      amountCents: 12050,
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Cloud",
      priority: "medium",
      status: "unpaid",
      tags: ["cloud", "infrastructure"],
      notes: "Production account"
    }
  ];

  it("generates valid CSV from bill data", () => {
    const csv = exportBillsToCsv(bills);
    expect(csv).toContain("name,amount,currency,dueDate");
    expect(csv).toContain("AWS Invoice");
    expect(csv).toContain("120.50");
  });

  it("round-trips through parse", () => {
    const csv = generateBillCsv(bills);
    const parsed = parseBillCsv(csv);
    expect(parsed.errors).toHaveLength(0);
    expect(parsed.validRows).toHaveLength(1);
    expect(parsed.validRows[0]?.bill.name).toBe("AWS Invoice");
    expect(parsed.validRows[0]?.bill.amountCents).toBe(12050);
  });
});
