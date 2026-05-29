import { describe, expect, it } from "vitest";
import { billInputSchema } from "@/lib/billing/validation";

describe("billInputSchema", () => {
  it("accepts a valid recurring bill", () => {
    const result = billInputSchema.parse({
      name: "AWS Invoice",
      amount: "120.50",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Cloud",
      priority: "medium",
      status: "unpaid",
      tags: "cloud, infrastructure",
      notes: "Production account"
    });

    expect(result.tags).toEqual(["cloud", "infrastructure"]);
    expect(result.amountCents).toBe(12050);
  });

  it("rejects missing names, zero amounts, and invalid dates", () => {
    const result = billInputSchema.safeParse({
      name: "",
      amount: "0",
      currency: "USD",
      dueDate: "31/31/2026",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("accepts name at exact max length of 120 characters", () => {
    const result = billInputSchema.safeParse({
      name: "A".repeat(120),
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(true);
  });

  it("rejects name exceeding 120 characters", () => {
    const result = billInputSchema.safeParse({
      name: "A".repeat(121),
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects negative amounts", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "-50.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects amount with more than 2 decimals", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "100.999",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("trims amount whitespace", () => {
    const result = billInputSchema.parse({
      name: "Test",
      amount: " 100.50 ",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.amountCents).toBe(10050);
  });

  it("rejects unsupported currency", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "100.00",
      currency: "JPY",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid cycle", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "weekly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid priority", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "urgent",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects overdue as input status", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "overdue",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("accepts skipped status as input", () => {
    const result = billInputSchema.parse({
      name: "Test",
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "skipped",
      tags: "",
      notes: ""
    });

    expect(result.status).toBe("skipped");
  });

  it("filters empty tag entries", () => {
    const result = billInputSchema.parse({
      name: "Test",
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "tag1,,tag2",
      notes: ""
    });

    expect(result.tags).toEqual(["tag1", "tag2"]);
  });

  it("rejects notes exceeding 2000 characters", () => {
    const result = billInputSchema.safeParse({
      name: "Test",
      amount: "100.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: "x".repeat(2001)
    });

    expect(result.success).toBe(false);
  });
});
