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
});
