import { Card } from "@/components/ui/card";
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

export function SummaryCards({
  monthlyObligationsCents,
  yearlyProjectionCents,
  pendingCount,
  pendingAmountCents,
  overdueCount,
  overdueAmountCents
}: SummaryCardsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Calendar size={20} className="text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted">Monthly Obligations</p>
            <p className="text-xl font-bold">${formatCents(monthlyObligationsCents)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <DollarSign size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted">Yearly Projection</p>
            <p className="text-xl font-bold">${formatCents(yearlyProjectionCents)}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-50">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-muted">Pending</p>
            <p className="text-xl font-bold">
              {pendingCount} / ${formatCents(pendingAmountCents)}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
            <AlertTriangle size={20} className="text-destructive" />
          </div>
          <div>
            <p className="text-sm text-muted">Overdue</p>
            <p className="text-xl font-bold">
              {overdueCount} / ${formatCents(overdueAmountCents)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
