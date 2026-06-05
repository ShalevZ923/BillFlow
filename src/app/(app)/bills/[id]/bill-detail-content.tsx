"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, Calendar, Check, AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { BillForm } from "@/components/bills/bill-form";
import { currencyOptions } from "@/lib/currency/supported";
import type { BillDetail, OccurrenceDetail, PaymentDetail } from "./actions";
import { updateBill, deleteBill, updateOccurrenceStatus } from "./actions";
import Link from "next/link";

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-muted-foreground",
  high: "text-amber-600 dark:text-amber-400",
  critical: "text-destructive"
};

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(c: number, code: string): string {
  return `${getSymbol(code)}${formatCents(c)}`;
}

type BillDetailContentProps = {
  bill: BillDetail;
  occurrences: OccurrenceDetail[];
  payments: PaymentDetail[];
};

export function BillDetailContent({ bill, occurrences, payments }: BillDetailContentProps) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleEdit = useCallback(
    async (data: Record<string, unknown>) => {
      setEditSubmitting(true);
      setEditError(null);

      try {
        const res = await updateBill(bill.id, {
          name: String(data.name),
          vendor: String(data.vendor ?? ""),
          amount: String(data.amount),
          currency: String(data.currency),
          dueDate: String(data.dueDate),
          cycle: String(data.cycle),
          customCycleDays: data.customCycleDays ? String(data.customCycleDays) : undefined,
          category: String(data.category),
          priority: String(data.priority),
          tags: String(data.tags ?? ""),
          notes: String(data.notes ?? "")
        });

        if (!res.success) {
          setEditError(res.error ?? "Failed to update bill");
          setEditSubmitting(false);
          return;
        }

        setEditOpen(false);
        router.refresh();
      } catch {
        setEditError("Network error. Please try again.");
        setEditSubmitting(false);
      }
    },
    [bill.id, router]
  );

  const handleDelete = useCallback(async () => {
    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      const res = await deleteBill(bill.id);

      if (!res.success) {
        setDeleteError(res.error ?? "Failed to delete bill");
        setDeleteSubmitting(false);
        return;
      }

      router.push("/bills");
    } catch {
      setDeleteError("Network error. Please try again.");
      setDeleteSubmitting(false);
    }
  }, [bill.id, router]);

  const handleStatusChange = useCallback(
    async (occurrenceId: string, newStatus: "paid" | "unpaid" | "skipped") => {
      await updateOccurrenceStatus(occurrenceId, newStatus);
      router.refresh();
    },
    [router]
  );

  const editDefaultValues = {
    name: bill.name,
    vendor: bill.vendor,
    amount: formatCents(bill.amountCents),
    currency: bill.currency,
    dueDate: bill.firstDueDate,
    cycle: bill.cycle as "one-time" | "monthly" | "yearly" | "custom",
    customCycleDays: bill.customCycleDays?.toString() ?? "",
    category: bill.category,
    priority: bill.priority as "low" | "medium" | "high" | "critical",
    status: "unpaid" as const,
    tags: bill.tags.join(", "),
    notes: bill.notes
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/bills" className="text-muted-foreground hover:text-foreground transition">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{bill.name}</h1>
            {bill.vendor && (
              <p className="mt-0.5 text-sm text-muted-foreground">{bill.vendor}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil size={16} />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setDeleteOpen(true)}>
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-white p-6 dark:bg-card">
          <h2 className="text-sm font-semibold mb-4">Bill Details</h2>
          <dl className="space-y-3">
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-muted-foreground">Amount</dt>
              <dd className="text-sm font-semibold">
                {formatCurrency(bill.amountCents, bill.currency)}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-muted-foreground">Cycle</dt>
              <dd className="text-sm capitalize">{bill.cycle}</dd>
            </div>
            {bill.customCycleDays != null && (
              <div className="flex justify-between gap-2">
                <dt className="text-sm text-muted-foreground">Custom Cycle</dt>
                <dd className="text-sm">{bill.customCycleDays} days</dd>
              </div>
            )}
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-muted-foreground">First Due Date</dt>
              <dd className="text-sm">{bill.firstDueDate}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-muted-foreground">Category</dt>
              <dd className="text-sm">{bill.category}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-muted-foreground">Priority</dt>
              <dd
                className={`text-sm font-medium capitalize ${priorityColors[bill.priority] ?? "text-muted-foreground"}`}
              >
                {bill.priority}
              </dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-sm text-muted-foreground">Status</dt>
              <dd className="text-sm">
                {bill.active ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="default">Inactive</Badge>
                )}
              </dd>
            </div>
          </dl>
          {bill.tags.length > 0 && (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground mb-1.5">Tags</dt>
              <dd className="flex flex-wrap gap-1.5">
                {bill.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded border border-border bg-background px-2 py-0.5 text-xs text-muted-foreground dark:bg-muted/20"
                  >
                    {tag}
                  </span>
                ))}
              </dd>
            </div>
          )}
          {bill.notes && (
            <div className="mt-4">
              <dt className="text-sm text-muted-foreground mb-1.5">Notes</dt>
              <dd className="text-sm whitespace-pre-wrap">{bill.notes}</dd>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-6 dark:bg-card">
            <h2 className="text-sm font-semibold mb-4">Occurrences</h2>
            {occurrences.length === 0 ? (
              <p className="text-sm text-muted-foreground">No occurrences generated yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {occurrences.map((occ) => {
                  return (
                    <div
                      key={occ.id}
                      className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm">{occ.dueDate}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {formatCurrency(occ.amountCents, occ.currency)}
                        </span>
                        <select
                          value={occ.status}
                          onChange={(e) =>
                            handleStatusChange(occ.id, e.target.value as "paid" | "unpaid" | "skipped")
                          }
                          className="h-7 rounded-md border border-border bg-background px-2 text-xs capitalize focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                        >
                          <option value="unpaid">Unpaid</option>
                          <option value="paid">Paid</option>
                          <option value="skipped">Skipped</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-border bg-white p-6 dark:bg-card">
            <h2 className="text-sm font-semibold mb-4">Payment History</h2>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {payments.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                        <Check size={14} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm">{p.paidDate}</span>
                        {p.dueDate && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            (due: {p.dueDate})
                          </span>
                        )}
                        {p.method !== "other" && (
                          <span className="ml-1 text-xs text-muted-foreground capitalize">
                            via {p.method}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-sm font-semibold shrink-0">
                      {formatCurrency(p.paidAmountCents, p.paidCurrency)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent
          className="max-w-xl p-0 gap-0"
          overlayClassName="bg-black/40 backdrop-blur-md"
          showCloseButton={false}
        >
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Pencil size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Edit Bill</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                Update the bill details below.
              </DialogDescription>
            </div>
            <button
              onClick={() => setEditOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-5">
            {editError && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {editError}
              </div>
            )}
            <BillForm
              defaultValues={editDefaultValues}
              onSubmit={handleEdit}
              isSubmitting={editSubmitting}
              submitLabel="Save Changes"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md p-0 gap-0" overlayClassName="bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle size={20} className="text-destructive" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">Delete Bill</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                This will permanently delete this bill and all its occurrences.
              </DialogDescription>
            </div>
          </div>
          <div className="px-6 py-5">
            {deleteError && (
              <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {deleteError}
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{bill.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleteSubmitting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleteSubmitting}>
                {deleteSubmitting && <Loader2 size={16} className="animate-spin" />}
                {deleteSubmitting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
