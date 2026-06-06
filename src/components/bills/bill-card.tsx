"use client";

import { memo, useState, useCallback, useMemo } from "react";
import { clsx } from "clsx";
import { Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BillCardMenu } from "@/components/bills/bill-card-menu";
import { EditBillDialog } from "@/components/bills/edit-bill-dialog";
import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";
import { currencyOptions } from "@/lib/currency/supported";
import type { BillData } from "@/app/(app)/bills/actions";

type BillCardProps = {
  id: string;
  name: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  category: string;
  priority: BillPriority;
  status: OccurrenceStatus;
  tags: string[];
  vendor?: string;
  cycle?: string;
  notes?: string;
  onChange?: () => void;
};

const statusVariant: Record<OccurrenceStatus, "default" | "success" | "warning" | "destructive"> = {
  unpaid: "default",
  paid: "success",
  skipped: "warning",
  overdue: "destructive"
};

const priorityColors: Record<BillPriority, string> = {
  low: "text-muted-foreground",
  medium: "text-muted-foreground",
  high: "text-yellow-600",
  critical: "text-destructive"
};

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function getCurrencySymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function toBillData(props: BillCardProps): BillData {
  return {
    id: props.id,
    name: props.name,
    vendor: props.vendor ?? "",
    amountCents: props.amountCents,
    currency: props.currency,
    dueDate: props.dueDate,
    cycle: props.cycle ?? "monthly",
    category: props.category,
    priority: props.priority,
    status: props.status,
    tags: props.tags,
    notes: props.notes ?? ""
  };
}

export const BillCard = memo(function BillCard({
  id,
  name,
  amountCents,
  currency,
  dueDate,
  category,
  priority,
  status,
  tags,
  vendor,
  cycle,
  notes,
  onChange
}: BillCardProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"edit" | "delete">("edit");

  const billData = useMemo(
    () => toBillData({ id, name, amountCents, currency, dueDate, category, priority, status, tags, vendor, cycle, notes, onChange }),
    [id, name, amountCents, currency, dueDate, category, priority, status, tags, vendor, cycle, notes, onChange]
  );

  const handleSaved = useCallback(() => {
    onChange?.();
  }, [onChange]);

  const handleDeleted = useCallback(() => {
    onChange?.();
  }, [onChange]);

  return (
    <>
      <Card className="relative transition hover:shadow-sm hover:border-primary/30 group">
        <Link href={`/bills/${id}`} className="block">
          <CardContent>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold truncate">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{category}</p>
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
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar size={12} />
                {dueDate}
              </span>
            </div>

            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <Tag size={12} className="text-muted-foreground" />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border bg-background px-1.5 py-0.5 text-xs text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Link>

        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <BillCardMenu
            onEdit={() => { setDialogMode("edit"); setEditOpen(true); }}
            onDelete={() => { setDialogMode("delete"); setEditOpen(true); }}
          />
        </div>
      </Card>

      <EditBillDialog
        bill={billData}
        open={editOpen}
        onOpenChange={setEditOpen}
        onSaved={handleSaved}
        onDeleted={handleDeleted}
        initialMode={dialogMode}
      />
    </>
  );
});
