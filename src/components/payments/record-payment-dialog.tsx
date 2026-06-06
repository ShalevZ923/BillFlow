"use client";

import { memo, useState, useEffect, useCallback } from "react";
import { PaymentForm, type PaymentFormValues } from "@/components/payments/payment-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Loader2, AlertCircle } from "lucide-react";
import { getUnpaidOccurrences, type OccurrenceOption } from "@/app/(app)/payments/actions";

export type PaymentRecord = {
  id: string;
  billName: string;
  category: string;
  paidAmountCents: number;
  paidCurrency: string;
  paidDate: string;
  method: string;
  note: string;
  status: string;
};

type RecordPaymentDialogProps = {
  onPaymentRecorded: (payment: PaymentRecord) => void;
};

export const RecordPaymentDialog = memo(function RecordPaymentDialog({ onPaymentRecorded }: RecordPaymentDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [occurrences, setOccurrences] = useState<OccurrenceOption[]>([]);
  const [loadingOccurrences, setLoadingOccurrences] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<OccurrenceOption | null>(null);

  const loadOccurrences = useCallback(async () => {
    setLoadingOccurrences(true);
    try {
      const data = await getUnpaidOccurrences();
      setOccurrences(data);
    } catch {
      setOccurrences([]);
    } finally {
      setLoadingOccurrences(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      setSelectedOccurrence(null);
      setSuccess(false);
      setError(null);
      loadOccurrences();
    }
  }, [open, loadOccurrences]);

  const handleSubmit = useCallback(async (data: PaymentFormValues) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to record payment");
      }

      const result = await response.json();

      const newPayment: PaymentRecord = {
        id: result.paymentId,
        billName: selectedOccurrence?.billName ?? "Unknown",
        category: selectedOccurrence?.category ?? "Other",
        paidAmountCents: Math.round(parseFloat(data.paidAmount) * 100),
        paidCurrency: data.paidCurrency,
        paidDate: data.paidDate,
        method: data.method,
        note: data.note,
        status: "paid",
      };

      onPaymentRecorded(newPayment);
      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 800);
    } catch (e) {
      setIsSubmitting(false);
      setError(e instanceof Error ? e.message : "Failed to record payment");
    }
  }, [selectedOccurrence, onPaymentRecorded]);

  const handleOpenChange = useCallback((open: boolean) => {
    setOpen(open);
  }, []);

  const handleSelectOccurrence = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const occ = occurrences.find((o) => o.id === e.target.value);
    if (occ) setSelectedOccurrence(occ);
  }, [occurrences]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        Record Payment
      </Button>

      <DialogContent
        className="max-w-lg p-0 gap-0"
        overlayClassName="bg-black/40 backdrop-blur-md"
        showCloseButton={false}
      >
        <div className="relative">
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CreditCard size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {success ? "Payment recorded" : "Record payment"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {success
                  ? "Your payment has been recorded successfully."
                  : "Enter the payment details below."}
              </DialogDescription>
            </div>
            <button
              onClick={() => setOpen(false)}
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
              <p className="mt-4 text-sm text-muted-foreground">
                Closing...
              </p>
            </div>
          ) : (
            <div className="px-6 py-5">
              {loadingOccurrences ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={20} className="animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading occurrences...</span>
                </div>
              ) : occurrences.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <AlertCircle size={24} className="text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    No unpaid occurrences found. Create bills first, then record payments against them.
                  </p>
                </div>
              ) : selectedOccurrence ? (
                <>
                  {error && (
                    <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}
                  <PaymentForm
                    key={selectedOccurrence.id}
                    onSubmit={handleSubmit}
                    isSubmitting={isSubmitting}
                    occurrenceId={selectedOccurrence.id}
                    currency={selectedOccurrence.currency}
                    billLabel={`${selectedOccurrence.billName} — Due ${selectedOccurrence.dueDate}`}
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Select a bill occurrence to pay:</p>
                  <select
                    className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                    onChange={handleSelectOccurrence}
                    defaultValue=""
                  >
                    <option value="" disabled>Select a bill...</option>
                    {occurrences.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.billName} — Due {o.dueDate} ({o.currency} {(o.amountCents / 100).toFixed(2)}) — {o.status}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
});
