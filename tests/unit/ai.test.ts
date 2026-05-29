import { describe, expect, it } from "vitest";
import { aiFillResponseSchema, dailyInsightResponseSchema } from "@/lib/ai/schemas";

describe("AI schemas", () => {
  it("accepts a valid AI Fill response", () => {
    const result = aiFillResponseSchema.parse({
      name: "AWS Invoice",
      amount: "120.50",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Cloud",
      priority: "medium",
      tags: ["cloud", "infrastructure"],
      notes: "Extracted from invoice text"
    });

    expect(result.currency).toBe("USD");
    expect(result.tags).toEqual(["cloud", "infrastructure"]);
  });

  it("rejects unsupported currency in AI Fill", () => {
    const result = aiFillResponseSchema.safeParse({
      name: "Test",
      amount: "100",
      currency: "INVALID",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      tags: [],
      notes: ""
    });

    expect(result.success).toBe(false);
  });

  it("accepts a valid daily insight response", () => {
    const result = dailyInsightResponseSchema.parse({
      summary: "Your SaaS spending is up 15% this month.",
      suggestions: ["Review unused subscriptions", "Consider annual billing"],
      riskLevel: "medium"
    });

    expect(result.riskLevel).toBe("medium");
    expect(result.suggestions).toHaveLength(2);
  });

  it("rejects invalid risk level", () => {
    const result = dailyInsightResponseSchema.safeParse({
      summary: "Test",
      suggestions: ["Test"],
      riskLevel: "critical"
    });

    expect(result.success).toBe(false);
  });
});
