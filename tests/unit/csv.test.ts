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

  it("supports due_date alternate column name", () => {
    const csv = `name,amount,currency,due_date,cycle,category,priority,status,tags,notes
Test,50.00,USD,2026-06-15,monthly,Other,medium,unpaid,,`;
    const result = parseBillCsv(csv);
    expect(result.validRows).toHaveLength(1);
  });

  it("supports billingcycle alternate column name", () => {
    const csv = `name,amount,currency,dueDate,billingcycle,category,priority,status,tags,notes
Test,50.00,USD,2026-06-15,monthly,Other,medium,unpaid,,`;
    const result = parseBillCsv(csv);
    expect(result.validRows).toHaveLength(1);
  });

  it("handles header-only CSV with no data rows", () => {
    const csv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes`;
    const result = parseBillCsv(csv);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it("handles CSV with quoted names and special characters", () => {
    const csv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
"ACME, Inc.",100.00,USD,2026-06-15,monthly,Other,medium,unpaid,,"Note with line"`;
    const result = parseBillCsv(csv);
    expect(result.errors.length).toBe(0);
    expect(result.validRows[0]?.bill.name).toBe("ACME, Inc.");
    expect(result.validRows[0]?.bill.notes).toBe("Note with line");
  });

  it("handles Windows CRLF line endings", () => {
    const csv = "name,amount,currency,dueDate,cycle,category,priority,status,tags,notes\r\nTest,50.00,USD,2026-06-15,monthly,Other,medium,unpaid,,";
    const result = parseBillCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toHaveLength(1);
  });

  it("collects all errors when every row is invalid", () => {
    const csv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
,abc,USD,2026-06-15,monthly,Other,medium,unpaid,,
,xyz,USD,2026-06-15,monthly,Other,medium,unpaid,,`;
    const result = parseBillCsv(csv);
    expect(result.errors.length).toBeGreaterThan(1);
    expect(result.validRows).toHaveLength(0);
  });

  it("ignores empty rows between data", () => {
    const csv = `name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
Test,50.00,USD,2026-06-15,monthly,Other,medium,unpaid,,

Test2,50.00,USD,2026-07-15,monthly,Other,medium,unpaid,,`;
    const result = parseBillCsv(csv);
    expect(result.validRows).toHaveLength(2);
  });

  it("uses defaults for missing optional fields", () => {
    const csv = `name,amount,currency,dueDate
Test,50.00,USD,2026-06-15`;
    const result = parseBillCsv(csv);
    expect(result.validRows).toHaveLength(1);
    expect(result.validRows[0]?.bill.category).toBe("Other");
    expect(result.validRows[0]?.bill.cycle).toBe("one-time");
    expect(result.validRows[0]?.bill.priority).toBe("medium");
    expect(result.validRows[0]?.bill.status).toBe("unpaid");
  });
});

describe("CSV export", () => {
  const bills: BillInput[] = [
    {
      name: "AWS Invoice",
      vendor: "Amazon",
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

  it("generates only header for empty bill array", () => {
    const csv = generateBillCsv([]);
    expect(csv).toBe("name,amount,currency,dueDate,cycle,category,priority,status,tags,notes");
  });

  it("escapes double quotes in notes during export", () => {
    const billWithQuotes: BillInput = {
      name: "Test",
      vendor: "",
      amountCents: 1000,
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: [],
      notes: "Note with quotes inside"
    };
    const csv = generateBillCsv([billWithQuotes]);
    expect(csv).toContain("Note with quotes inside");
  });
});
