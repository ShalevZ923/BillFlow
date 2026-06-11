import { CategoryChart } from "@/components/dashboard/category-chart";
import { MonthlyBreakdown } from "@/components/dashboard/monthly-breakdown";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";

export function SupportingAnalyticsModule({ context }: DashboardModuleProps) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <MonthlyBreakdown monthlyBreakdown={context.payload.monthlyBreakdown} />
      <CategoryChart categoryTotals={context.payload.categoryTotals} />
    </div>
  );
}
