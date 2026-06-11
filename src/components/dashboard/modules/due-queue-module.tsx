import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import {
  formatDashboardCurrency,
  formatDashboardDate,
  formatDueDistance
} from "@/components/dashboard/modules/format";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";
import { cn } from "@/lib/utils";

const statusVariant = {
  overdue: "destructive",
  unpaid: "warning",
  paid: "success",
  skipped: "secondary"
} as const;

const priorityClass: Record<string, string> = {
  critical: "text-destructive",
  high: "text-yellow-700",
  medium: "text-muted-foreground",
  low: "text-muted-foreground"
};

export function DueQueueModule({ context }: DashboardModuleProps) {
  const dueQueue = context.payload.dueQueue.slice(0, 7);

  return (
    <ModuleCard
      title="Due queue"
      description="Overdue, due-today, and upcoming bills ordered by urgency."
      action={
        <Button variant="outline" size="sm" onClick={() => context.onNavigate("/bills")}>
          View bills
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      }
    >
      {dueQueue.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center">
          <CheckCircle2 className="text-primary" />
          <div>
            <p className="text-sm font-medium">No urgent bills</p>
            <p className="mt-1 text-sm text-muted-foreground">
              New due and overdue obligations will appear here automatically.
            </p>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[760px]">
            <div className="grid grid-cols-[minmax(220px,1.4fr)_110px_110px_110px_150px] border-b border-border px-2 pb-2 text-xs font-medium uppercase text-muted-foreground">
              <span>Bill</span>
              <span>Status</span>
              <span>Priority</span>
              <span>Amount</span>
              <span className="text-right">Action</span>
            </div>
            <div>
              {dueQueue.map((item) => (
                <div
                  key={item.id}
                  className={cn(
                    "grid grid-cols-[minmax(220px,1.4fr)_110px_110px_110px_150px] items-center gap-0 rounded-lg px-2 py-3 text-sm transition hover:bg-muted/50",
                    item.status === "overdue" && "bg-destructive/[0.03]"
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {item.vendor || item.category} / {formatDashboardDate(item.dueDate)} /{" "}
                      {formatDueDistance(item.daysUntilDue)}
                    </p>
                  </div>
                  <Badge variant={statusVariant[item.status] ?? "secondary"} className="capitalize">
                    {item.status}
                  </Badge>
                  <span className={cn("text-xs font-semibold capitalize", priorityClass[item.priority])}>
                    {item.priority}
                  </span>
                  <span className="font-semibold">
                    {formatDashboardCurrency(item.amountCents, item.currency)}
                  </span>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => context.onOpenBill(item.billId)}>
                      Open bill
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => context.onNavigate("/payments")}>
                      Pay
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </ModuleCard>
  );
}
