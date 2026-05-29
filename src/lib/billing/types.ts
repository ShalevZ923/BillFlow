export const supportedCurrencies = ["USD", "EUR", "GBP", "ILS"] as const;
export const billingCycles = ["one-time", "monthly", "yearly", "custom"] as const;
export const billPriorities = ["low", "medium", "high", "critical"] as const;
export const occurrenceStatuses = ["unpaid", "paid", "skipped", "overdue"] as const;

export type CurrencyCode = (typeof supportedCurrencies)[number];
export type BillingCycle = (typeof billingCycles)[number];
export type BillPriority = (typeof billPriorities)[number];
export type OccurrenceStatus = (typeof occurrenceStatuses)[number];

export type BillInput = {
  name: string;
  amountCents: number;
  currency: CurrencyCode;
  dueDate: string;
  cycle: BillingCycle;
  category: string;
  priority: BillPriority;
  status: Exclude<OccurrenceStatus, "overdue">;
  tags: string[];
  notes: string;
};
