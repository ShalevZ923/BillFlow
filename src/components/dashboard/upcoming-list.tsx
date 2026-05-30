import { clsx } from "clsx";
import { format } from "date-fns";
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
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

function formatDaysLabel(days: number, status: OccurrenceStatus): string {
  if (status === "overdue") {
    if (days === 1) return "Overdue by 1 day";
    return `Overdue by ${days} days`;
  }
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `Due in ${days} days`;
}

function formatDueDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return format(date, "MMM d, yyyy");
  } catch {
    return dateStr;
  }
}

export function UpcomingList({ items }: UpcomingListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming 30 Days</CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
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
                  <Calendar size={16} className="text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{formatDueDate(item.dueDate)}</p>
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
                      item.daysUntilDue <= 3 ? "text-destructive" : "text-muted-foreground"
                    )}
                  >
                    {formatDaysLabel(item.daysUntilDue, item.status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
