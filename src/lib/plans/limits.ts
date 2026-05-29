export type Plan = "free" | "pro";

export type PlanCapabilities = {
  maxBills: number | null;
  aiInsights: boolean;
  aiFill: boolean;
  csvImport: boolean;
  csvExport: boolean;
  liveCurrencyConverter: boolean;
};

const capabilities: Record<Plan, PlanCapabilities> = {
  free: {
    maxBills: 25,
    aiInsights: false,
    aiFill: false,
    csvImport: false,
    csvExport: true,
    liveCurrencyConverter: false
  },
  pro: {
    maxBills: null,
    aiInsights: true,
    aiFill: true,
    csvImport: true,
    csvExport: true,
    liveCurrencyConverter: true
  }
};

export function getPlanCapabilities(plan: Plan): PlanCapabilities {
  return capabilities[plan];
}

export function canCreateBill(input: { plan: Plan; currentBillCount: number }): { allowed: true } | { allowed: false; reason: string } {
  const planCapabilities = getPlanCapabilities(input.plan);

  if (planCapabilities.maxBills !== null && input.currentBillCount >= planCapabilities.maxBills) {
    return { allowed: false, reason: "Free plan supports up to 25 bills" };
  }

  return { allowed: true };
}
