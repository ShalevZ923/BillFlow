import { memo, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Calendar, Clock, DollarSign } from "lucide-react";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

type SummaryCardsProps = {
  monthlyObligationsCents: number;
  yearlyProjectionCents: number;
  pendingCount: number;
  pendingAmountCents: number;
  overdueCount: number;
  overdueAmountCents: number;
};

export const SummaryCards = memo(function SummaryCards({
  monthlyObligationsCents,
  yearlyProjectionCents,
  pendingCount,
  pendingAmountCents,
  overdueCount,
  overdueAmountCents
}: SummaryCardsProps) {
  const formatted = useMemo(() => ({
    monthly: formatCents(monthlyObligationsCents),
    yearly: formatCents(yearlyProjectionCents),
    pending: formatCents(pendingAmountCents),
    overdue: formatCents(overdueAmountCents)
  }), [monthlyObligationsCents, yearlyProjectionCents, pendingAmountCents, overdueAmountCents]);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Calendar size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly Obligations</p>
              <p className="text-xl font-bold">${formatted.monthly}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <DollarSign size={20} className="text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Yearly Projection</p>
              <p className="text-xl font-bold">${formatted.yearly}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
              <Clock size={20} className="text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-xl font-bold">
                {pendingCount} / ${formatted.pending}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-xl font-bold">
                {overdueCount} / ${formatted.overdue}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
