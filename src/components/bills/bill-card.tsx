import { clsx } from "clsx";
import { Calendar, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";
import { currencyOptions } from "@/lib/currency/supported";

type BillCardProps = {
  name: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  category: string;
  priority: BillPriority;
  status: OccurrenceStatus;
  tags: string[];
};

const statusVariant: Record<OccurrenceStatus, "default" | "success" | "warning" | "destructive"> = {
  unpaid: "default",
  paid: "success",
  skipped: "warning",
  overdue: "destructive"
};

const priorityColors: Record<BillPriority, string> = {
  low: "text-muted",
  medium: "text-muted",
  high: "text-yellow-600",
  critical: "text-destructive"
};

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function getCurrencySymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

export function BillCard({ name, amountCents, currency, dueDate, category, priority, status, tags }: BillCardProps) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">{name}</h3>
          <p className="mt-1 text-sm text-muted">{category}</p>
        </div>
        <p className="text-lg font-bold whitespace-nowrap">
          {getCurrencySymbol(currency)}
          {formatCents(amountCents)}
        </p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={statusVariant[status]}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
        <span className={clsx("text-xs font-medium", priorityColors[priority])}>
          {priority}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted">
          <Calendar size={12} />
          {dueDate}
        </span>
      </div>

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <Tag size={12} className="text-muted" />
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
