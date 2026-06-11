import { ArrowUpRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import { formatDashboardCurrency, formatDashboardDate } from "@/components/dashboard/modules/format";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";

const statusVariant = {
  overdue: "destructive",
  unpaid: "warning",
  paid: "success",
  skipped: "secondary"
} as const;

export function SecondaryBillsModule({ context }: DashboardModuleProps) {
  const bills = context.bills.slice(0, 5);

  return (
    <ModuleCard
      title="Recent bills"
      description="A compact preview. Full management lives on Bills."
      action={
        <Button variant="outline" size="sm" onClick={() => context.onNavigate("/bills")}>
          Open bills
          <ArrowUpRight data-icon="inline-end" />
        </Button>
      }
    >
      {bills.length === 0 ? (
        <div className="flex min-h-36 items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 text-sm text-muted-foreground">
          Add your first bill to populate this workspace.
        </div>
      ) : (
        <div className="flex flex-col gap-1">
          {bills.map((bill) => (
            <button
              key={bill.id}
              type="button"
              onClick={() => context.onOpenBill(bill.id)}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-2 py-2 text-left text-sm transition hover:bg-muted/50"
            >
              <span className="min-w-0">
                <span className="block truncate font-medium">{bill.name}</span>
                <span className="mt-1 block truncate text-xs text-muted-foreground">
                  {formatDashboardCurrency(bill.amountCents, bill.currency)} / {formatDashboardDate(bill.dueDate)}
                </span>
              </span>
              <Badge variant={statusVariant[bill.status] ?? "secondary"} className="capitalize">
                {bill.status}
              </Badge>
            </button>
          ))}
        </div>
      )}
    </ModuleCard>
  );
}
