import { describe, expect, it } from "vitest";
import { billInputSchema } from "@/lib/billing/validation";
import { canCreateBill } from "@/lib/plans/limits";

describe("bill creation route logic", () => {
  it("validates a proper bill input", () => {
    const result = billInputSchema.safeParse({
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

    expect(result.success).toBe(true);
  });

  it("rejects empty bill name", () => {
    const result = billInputSchema.safeParse({
      name: "",
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

  it("blocks free user at 25 bills", () => {
    expect(canCreateBill({ plan: "free", currentBillCount: 25 })).toEqual({
      allowed: false,
      reason: "Free plan supports up to 25 bills"
    });
  });

  it("allows pro user at any count", () => {
    expect(canCreateBill({ plan: "pro", currentBillCount: 500 })).toEqual({ allowed: true });
  });
});
