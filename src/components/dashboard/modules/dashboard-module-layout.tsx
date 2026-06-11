import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardModulesByZone } from "@/components/dashboard/modules/registry";
import type { DashboardModuleContext, DashboardZone } from "@/components/dashboard/modules/types";

type DashboardModuleLayoutProps = {
  context: DashboardModuleContext;
};

function renderZone(zone: DashboardZone, context: DashboardModuleContext) {
  return getDashboardModulesByZone(zone).map((definition) => {
    const Component = definition.component;
    return <Component key={definition.id} context={context} />;
  });
}

export function DashboardModuleLayout({ context }: DashboardModuleLayoutProps) {
  const overdueCount = context.payload.summary.overdueCount;

  return (
    <div className="flex flex-col gap-6">
      {overdueCount > 0 ? (
        <div className="flex flex-col gap-3 rounded-lg border border-destructive/20 bg-destructive/[0.04] p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
              <AlertTriangle />
            </span>
            <div>
              <p className="font-semibold text-destructive">Overdue bills need attention</p>
              <p className="mt-1 text-muted-foreground">
                {overdueCount} overdue bill{overdueCount === 1 ? "" : "s"} are included at the top of the due queue.
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => context.onNavigate("/bills")}>
            Review bills
          </Button>
        </div>
      ) : null}

      <section aria-label="Operational summary">{renderZone("kpi", context)}</section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <main className="flex min-w-0 flex-col gap-6">
          <section aria-label="Due queue">{renderZone("main", context)}</section>
          <section aria-label="Supporting analytics">{renderZone("analytics", context)}</section>
        </main>
        <aside className="min-w-0">{renderZone("rail", context)}</aside>
      </div>

      <section aria-label="Recent dashboard context" className="grid gap-4 xl:grid-cols-2">
        {renderZone("secondary", context)}
      </section>
    </div>
  );
}
