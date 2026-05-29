import { describe, expect, it } from "vitest";
import { aiFillResponseSchema } from "@/lib/ai/schemas";

describe("AI route logic", () => {
  it("validates AI Fill input has required text", () => {
    const result = aiFillResponseSchema.safeParse({
      name: "",
      amount: "0",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "one-time",
      category: "Other",
      priority: "medium",
      tags: [],
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("accepts minimal valid AI Fill suggestion", () => {
    const result = aiFillResponseSchema.parse({
      name: "Test Bill",
      amount: "50.00",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "one-time",
      category: "Other",
      priority: "medium",
      tags: [],
      notes: ""
    });

    expect(result.name).toBe("Test Bill");
  });
});
