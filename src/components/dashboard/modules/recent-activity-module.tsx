import { AlertTriangle, Check, Plus, Upload } from "lucide-react";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import { formatDashboardCurrency } from "@/components/dashboard/modules/format";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";
import { cn } from "@/lib/utils";

const activityIcons = {
  paid: Check,
  added: Plus,
  imported: Upload,
  overdue: AlertTriangle
};

const activityTone = {
  paid: "bg-primary/10 text-primary",
  added: "bg-primary/10 text-primary",
  imported: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive"
};

export function RecentActivityModule({ context }: DashboardModuleProps) {
  return (
    <ModuleCard title="Recent activity" description="Payments and risk changes from your account.">
      {context.activityItems.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          No recent activity yet.
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {context.activityItems.map((item) => {
            const Icon = activityIcons[item.action as keyof typeof activityIcons] ?? Check;
            const tone =
              activityTone[item.action as keyof typeof activityTone] ?? "bg-muted text-muted-foreground";

            return (
              <div key={item.id} className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm hover:bg-muted/50">
                <span className={cn("flex size-7 shrink-0 items-center justify-center rounded-full", tone)}>
                  <Icon />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{item.billName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {item.action}
                    {item.amountCents > 0 ? ` / ${formatDashboardCurrency(item.amountCents, context.currency)}` : ""}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
              </div>
            );
          })}
        </div>
      )}
    </ModuleCard>
  );
}
