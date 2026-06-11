import { AlertTriangle, ArrowRight, Calculator, FileUp, Plus, WalletCards } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";

export function ActionPanelModule({ context }: DashboardModuleProps) {
  const overdueCount = context.payload.summary.overdueCount;
  const hasDueQueue = context.payload.dueQueue.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <ModuleCard title="Next actions" description="Practical shortcuts based on current bill state.">
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => context.onNavigate(overdueCount > 0 ? "/bills" : "/payments")}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background p-3 text-left transition hover:bg-muted/50"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex size-8 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <AlertTriangle />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-medium">
                  {overdueCount > 0 ? "Review overdue bills" : "Record a payment"}
                </span>
                <span className="block truncate text-xs text-muted-foreground">
                  {overdueCount > 0 ? `${overdueCount} bill${overdueCount === 1 ? "" : "s"} need attention` : "Keep payment state current"}
                </span>
              </span>
            </span>
            {overdueCount > 0 ? <Badge variant="destructive">{overdueCount}</Badge> : <ArrowRight />}
          </button>

          <Button variant="outline" className="justify-start" onClick={() => context.onNavigate("/bills")}>
            <Plus data-icon="inline-start" />
            Add or manage bills
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => context.onNavigate("/import-export")}>
            <FileUp data-icon="inline-start" />
            Import bill data
          </Button>
          <Button variant="outline" className="justify-start" onClick={() => context.onNavigate("/currency")}>
            <WalletCards data-icon="inline-start" />
            Check currency impact
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => context.onNavigate("/calculator")}>
            <Calculator data-icon="inline-start" />
            Open calculator
          </Button>
        </div>
      </ModuleCard>

      <ModuleCard title="Queue health">
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Open in queue</span>
            <span className="font-semibold">{context.payload.dueQueue.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Due this week</span>
            <span className="font-semibold">{context.payload.summary.dueThisWeekCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Recent events</span>
            <span className="font-semibold">{context.activityItems.length}</span>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
            {hasDueQueue
              ? "Work the queue from the top down to clear the highest-risk obligations first."
              : "The queue is clear. New unpaid and overdue occurrences will surface automatically."}
          </div>
        </div>
      </ModuleCard>
    </div>
  );
}
