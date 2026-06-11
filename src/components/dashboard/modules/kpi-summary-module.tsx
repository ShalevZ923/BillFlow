import { AlertTriangle, CalendarClock, CheckCircle2, TrendingUp } from "lucide-react";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import { formatDashboardCurrency } from "@/components/dashboard/modules/format";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";
import { cn } from "@/lib/utils";

const kpiToneClass = {
  neutral: "bg-primary/10 text-primary",
  warning: "bg-yellow-50 text-yellow-700",
  risk: "bg-destructive/10 text-destructive",
  success: "bg-primary/10 text-primary"
};

export function KpiSummaryModule({ context }: DashboardModuleProps) {
  const { summary } = context.payload;
  const cards = [
    {
      label: "Due this week",
      value: summary.dueThisWeekCount.toString(),
      helper: "Open obligations",
      tone: summary.dueThisWeekCount > 0 ? "warning" : "neutral",
      icon: CalendarClock
    },
    {
      label: "Overdue",
      value: summary.overdueCount.toString(),
      helper: formatDashboardCurrency(summary.overdueAmountCents, context.currency),
      tone: summary.overdueCount > 0 ? "risk" : "neutral",
      icon: AlertTriangle
    },
    {
      label: "Paid MTD",
      value: formatDashboardCurrency(summary.paidMonthToDateCents, context.currency),
      helper: "Recorded payments",
      tone: "success",
      icon: CheckCircle2
    },
    {
      label: "Year projection",
      value: formatDashboardCurrency(summary.yearlyProjectionCents, context.currency),
      helper: `${summary.pendingCount} pending`,
      tone: "neutral",
      icon: TrendingUp
    }
  ] as const;

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <ModuleCard key={card.label} title={card.label} className="p-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tracking-tight">{card.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{card.helper}</p>
            </div>
            <div className={cn("flex size-9 items-center justify-center rounded-lg", kpiToneClass[card.tone])}>
              <card.icon />
            </div>
          </div>
        </ModuleCard>
      ))}
    </div>
  );
}
