import { describe, expect, it } from "vitest";
import { mapSubscriptionToPlan } from "@/lib/stripe/subscriptions";

describe("Stripe subscription mapping", () => {
  it("maps active subscription to pro", () => {
    expect(mapSubscriptionToPlan("active")).toBe("pro");
  });

  it("maps trialing subscription to pro", () => {
    expect(mapSubscriptionToPlan("trialing")).toBe("pro");
  });

  it("maps canceled subscription to free", () => {
    expect(mapSubscriptionToPlan("canceled")).toBe("free");
  });

  it("maps incomplete subscription to free", () => {
    expect(mapSubscriptionToPlan("incomplete")).toBe("free");
  });

  it("maps past_due subscription to free", () => {
    expect(mapSubscriptionToPlan("past_due")).toBe("free");
  });

  it("maps unpaid subscription to free", () => {
    expect(mapSubscriptionToPlan("unpaid")).toBe("free");
  });

  it("maps incomplete_expired subscription to free", () => {
    expect(mapSubscriptionToPlan("incomplete_expired")).toBe("free");
  });
});
