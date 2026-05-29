import { clsx } from "clsx";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { OccurrenceStatus } from "@/lib/billing/types";

type UpcomingItem = {
  id: string;
  billId: string;
  name: string;
  dueDate: string;
  amountCents: number;
  status: OccurrenceStatus;
  daysUntilDue: number;
};

type UpcomingListProps = {
  items: UpcomingItem[];
};

const statusVariant: Record<OccurrenceStatus, "default" | "success" | "warning" | "destructive"> = {
  unpaid: "default",
  paid: "success",
  skipped: "warning",
  overdue: "destructive"
};

export function UpcomingList({ items }: UpcomingListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming 30 Days</CardTitle>
      </CardHeader>
      {items.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-sm text-muted">
          No upcoming bills in the next 30 days
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted" />
                <div>
                  <p className="text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted">{item.dueDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant={statusVariant[item.status]}>
                  {item.status}
                </Badge>
                <span className="text-sm font-semibold">
                  ${(item.amountCents / 100).toFixed(2)}
                </span>
                <span
                  className={clsx(
                    "text-xs",
                    item.daysUntilDue <= 3 ? "text-destructive" : "text-muted"
                  )}
                >
                  {item.daysUntilDue}d
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
