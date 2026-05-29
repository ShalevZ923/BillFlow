import type { Plan } from "@/lib/plans/limits";

export type SubscriptionStatus = "active" | "trialing" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "unpaid";

export function mapSubscriptionToPlan(status: SubscriptionStatus): Plan {
  if (status === "active" || status === "trialing") {
    return "pro";
  }
  return "free";
}
