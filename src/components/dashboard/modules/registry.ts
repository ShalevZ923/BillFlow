import { ActionPanelModule } from "@/components/dashboard/modules/action-panel-module";
import { DueQueueModule } from "@/components/dashboard/modules/due-queue-module";
import { KpiSummaryModule } from "@/components/dashboard/modules/kpi-summary-module";
import { RecentActivityModule } from "@/components/dashboard/modules/recent-activity-module";
import { SecondaryBillsModule } from "@/components/dashboard/modules/secondary-bills-module";
import { SupportingAnalyticsModule } from "@/components/dashboard/modules/supporting-analytics-module";
import type { DashboardModuleDefinition, DashboardZone } from "@/components/dashboard/modules/types";

export const dashboardModuleRegistry: DashboardModuleDefinition[] = [
  {
    id: "kpi-summary",
    title: "Operational summary",
    description: "Top-level due, overdue, paid, and projection metrics.",
    zone: "kpi",
    size: "full",
    priority: 10,
    requiredData: ["summary"],
    component: KpiSummaryModule
  },
  {
    id: "due-queue",
    title: "Due queue",
    description: "Primary workflow module for overdue and due-soon bills.",
    zone: "main",
    size: "wide",
    priority: 10,
    requiredData: ["dueQueue"],
    component: DueQueueModule
  },
  {
    id: "action-panel",
    title: "Action panel",
    description: "Right-rail next actions and operational guidance.",
    zone: "rail",
    size: "rail",
    priority: 10,
    requiredData: ["summary", "dueQueue", "activity"],
    component: ActionPanelModule
  },
  {
    id: "supporting-analytics",
    title: "Supporting analytics",
    description: "Category and monthly breakdowns below the workflow.",
    zone: "analytics",
    size: "full",
    priority: 10,
    requiredData: ["categoryTotals", "monthlyBreakdown"],
    component: SupportingAnalyticsModule
  },
  {
    id: "recent-activity",
    title: "Recent activity",
    description: "Recent payment and overdue events.",
    zone: "secondary",
    size: "medium",
    priority: 10,
    requiredData: ["activity"],
    component: RecentActivityModule
  },
  {
    id: "secondary-bills",
    title: "Recent bills",
    description: "Compact bill preview with route to full bill management.",
    zone: "secondary",
    size: "medium",
    priority: 20,
    requiredData: ["bills"],
    component: SecondaryBillsModule
  }
];

export function getDashboardModulesByZone(zone: DashboardZone): DashboardModuleDefinition[] {
  return dashboardModuleRegistry
    .filter((module) => module.zone === zone)
    .sort((a, b) => a.priority - b.priority);
}
