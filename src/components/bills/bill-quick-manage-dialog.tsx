"use client";

import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import type { BillData } from "@/app/(app)/bills/actions";
import { currencyOptions } from "@/lib/currency/supported";

type BillQuickManageDialogProps = {
  bill: BillData | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (billId: string) => void;
  onDelete: (billId: string) => void;
};

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  unpaid: "warning",
  paid: "success",
  overdue: "destructive",
  skipped: "secondary"
};

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function getCurrencySymbol(code: string): string {
  return currencyOptions.find((currency) => currency.code === code)?.symbol ?? code;
}

function formatCurrency(cents: number, code: string): string {
  return `${getCurrencySymbol(code)}${formatCents(cents)}`;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

export function BillQuickManageDialog({
  bill,
  onOpenChange,
  onEdit,
  onDelete
}: BillQuickManageDialogProps) {
  return (
    <Dialog open={!!bill} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0" overlayClassName="bg-black/40 backdrop-blur-md">
        {bill && (
          <>
            <DialogHeader className="border-b border-border px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-xl font-semibold">{bill.name}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {bill.vendor || "No vendor assigned"}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[bill.status] ?? "secondary"} className="capitalize">
                    {bill.status}
                  </Badge>
                  <Badge variant={bill.priority === "critical" ? "destructive" : "outline"} className="capitalize">
                    {bill.priority}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <DetailItem label="Amount" value={formatCurrency(bill.amountCents, bill.currency)} />
              <DetailItem label="Due date" value={formatDate(bill.dueDate)} />
              <DetailItem label="Cycle" value={bill.cycle} />
              <DetailItem label="Category" value={bill.category} />
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Tags</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {bill.tags.length > 0 ? (
                    bill.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
                <p className="mt-2 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                  {bill.notes || "No notes added."}
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" onClick={() => onDelete(bill.id)}>
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={() => onEdit(bill.id)}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
