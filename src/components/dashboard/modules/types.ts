import type { ComponentType } from "react";
import type { BillListItem } from "@/components/bills/bill-list";
import type { DashboardPayload } from "@/lib/dashboard/aggregate";
import type { CurrencyCode } from "@/lib/billing/types";

export type DashboardModuleSize = "small" | "medium" | "wide" | "rail" | "full";

export type DashboardZone = "kpi" | "main" | "rail" | "analytics" | "secondary";

export type DashboardActivityItem = {
  id: string;
  action: string;
  billName: string;
  amountCents: number;
  date: string;
};

export type DashboardModuleContext = {
  payload: DashboardPayload;
  bills: BillListItem[];
  activityItems: DashboardActivityItem[];
  currency: CurrencyCode;
  onNavigate: (href: string) => void;
  onOpenBill: (billId: string) => void;
  onRefresh: () => void;
};

export type DashboardModuleProps = {
  context: DashboardModuleContext;
};

export type DashboardModuleDefinition = {
  id: string;
  title: string;
  description: string;
  zone: DashboardZone;
  size: DashboardModuleSize;
  priority: number;
  requiredData: string[];
  component: ComponentType<DashboardModuleProps>;
};
