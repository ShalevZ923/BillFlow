"use client";

import { useState, useCallback, useEffect } from "react";
import { Pencil, Loader2, AlertTriangle } from "lucide-react";
import { BillForm } from "@/components/bills/bill-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { updateBill, deleteBill } from "@/app/(app)/bills/[id]/actions";
import type { BillData } from "@/app/(app)/bills/actions";

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

type EditBillDialogProps = {
  bill: BillData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
  onDeleted: () => void;
  initialMode?: "edit" | "delete";
};

export function EditBillDialog({
  bill,
  open,
  onOpenChange,
  onSaved,
  onDeleted,
  initialMode = "edit"
}: EditBillDialogProps) {
  const [mode, setMode] = useState<"edit" | "delete">(initialMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
      setError(null);
      setSuccess(false);
    }
  }, [open, initialMode]);

  const handleEdit = useCallback(
    async (data: Record<string, unknown>) => {
      setSubmitting(true);
      setError(null);

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
          setError(res.error ?? "Failed to update bill");
          setSubmitting(false);
          return;
        }

        setSuccess(true);
        setTimeout(() => {
          onOpenChange(false);
          setSuccess(false);
          setMode("edit");
          onSaved();
        }, 600);
      } catch {
        setError("Network error. Please try again.");
        setSubmitting(false);
      }
    },
    [bill.id, onOpenChange, onSaved]
  );

  const handleDelete = useCallback(async () => {
    setSubmitting(true);
    setError(null);

    try {
      const res = await deleteBill(bill.id);

      if (!res.success) {
        setError(res.error ?? "Failed to delete bill");
        setSubmitting(false);
        return;
      }

      onOpenChange(false);
      setMode("edit");
      onDeleted();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }, [bill.id, onOpenChange, onDeleted]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setMode("edit");
        setError(null);
        setSuccess(false);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const defaultValues = {
    name: bill.name,
    vendor: bill.vendor,
    amount: formatCents(bill.amountCents),
    currency: bill.currency,
    dueDate: bill.dueDate,
    cycle: bill.cycle as "one-time" | "monthly" | "yearly" | "custom",
    category: bill.category,
    priority: bill.priority as "low" | "medium" | "high" | "critical",
    status: "unpaid" as const,
    tags: bill.tags.join(", "),
    notes: bill.notes
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-xl p-0 gap-0"
        overlayClassName="bg-black/40 backdrop-blur-md"
        showCloseButton={false}
      >
        {mode === "delete" ? (
          <>
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
              <button
                onClick={() => handleOpenChange(false)}
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
              {error && (
                <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to delete <strong>{bill.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setMode("edit")} disabled={submitting}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete} disabled={submitting}>
                  {submitting && <Loader2 size={16} className="animate-spin" />}
                  {submitting ? "Deleting..." : "Delete"}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-border px-6 py-5">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Pencil size={20} className="text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">
                  {success ? "Bill updated" : "Edit Bill"}
                </DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground">
                  {success
                    ? "Your bill has been updated successfully."
                    : "Update the bill details below."}
                </DialogDescription>
              </div>
              <button
                onClick={() => handleOpenChange(false)}
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

            {success ? (
              <div className="flex flex-col items-center justify-center px-6 py-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">Refreshing...</p>
              </div>
            ) : (
              <div className="px-6 py-5">
                {error && (
                  <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <BillForm
                  defaultValues={defaultValues}
                  onSubmit={handleEdit}
                  isSubmitting={submitting}
                  submitLabel="Save Changes"
                />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
