import { describe, expect, it } from "vitest";
import { canCreateBill, getPlanCapabilities } from "@/lib/plans/limits";

describe("plan limits", () => {
  it("allows free users below 25 bills and blocks the 26th bill", () => {
    expect(canCreateBill({ plan: "free", currentBillCount: 24 })).toEqual({ allowed: true });
    expect(canCreateBill({ plan: "free", currentBillCount: 25 })).toEqual({
      allowed: false,
      reason: "Free plan supports up to 25 bills"
    });
  });

  it("allows pro users to create unlimited bills and use paid features", () => {
    expect(canCreateBill({ plan: "pro", currentBillCount: 500 })).toEqual({ allowed: true });
    expect(getPlanCapabilities("pro")).toMatchObject({
      aiInsights: true,
      aiFill: true,
      csvImport: true,
      csvExport: true,
      liveCurrencyConverter: true
    });
  });
});
