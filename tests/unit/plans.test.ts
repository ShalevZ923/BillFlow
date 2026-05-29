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

  it("allows pro users at any count", () => {
    expect(canCreateBill({ plan: "pro", currentBillCount: 500 })).toEqual({ allowed: true });
    expect(canCreateBill({ plan: "pro", currentBillCount: 0 })).toEqual({ allowed: true });
  });

  it("returns correct free plan capabilities", () => {
    const caps = getPlanCapabilities("free");
    expect(caps.maxBills).toBe(25);
    expect(caps.aiInsights).toBe(false);
    expect(caps.aiFill).toBe(false);
    expect(caps.csvImport).toBe(false);
    expect(caps.csvExport).toBe(true);
    expect(caps.liveCurrencyConverter).toBe(false);
  });

  it("returns correct pro plan capabilities", () => {
    const caps = getPlanCapabilities("pro");
    expect(caps.maxBills).toBeNull();
    expect(caps.aiInsights).toBe(true);
    expect(caps.aiFill).toBe(true);
    expect(caps.csvImport).toBe(true);
    expect(caps.csvExport).toBe(true);
    expect(caps.liveCurrencyConverter).toBe(true);
  });
});
