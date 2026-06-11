"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { RecordPaymentDialog } from "@/components/payments/record-payment-dialog";
import { PaymentHistoryTable, type PaymentRecord } from "@/components/payments/payment-history-table";
import { Loader2 } from "lucide-react";
import { getPayments } from "./actions";

type PaymentActionRecord = Awaited<ReturnType<typeof getPayments>>[number];

function toPaymentRecord(payment: PaymentActionRecord): PaymentRecord {
  return {
    id: payment.id,
    billName: payment.billName,
    category: payment.category,
    paidAmountCents: payment.paidAmountCents,
    paidCurrency: payment.paidCurrency,
    paidDate: payment.paidDate,
    method: payment.method,
    note: payment.note,
    status: payment.status
  };
}

export default function PaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPayments();
      setPayments(data.map(toPaymentRecord));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    void getPayments()
      .then((data) => {
        if (!cancelled) {
          setPayments(data.map(toPaymentRecord));
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Failed to load payments");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function handlePaymentRecorded(payment: PaymentRecord) {
    setPayments((prev) => [payment, ...prev]);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Payments</h1>
          <p className="mt-1 text-sm text-muted-foreground">Record and view payment history.</p>
        </div>
        <RecordPaymentDialog onPaymentRecorded={handlePaymentRecorded} />
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="flex items-center justify-center rounded-lg border border-border bg-white p-12">
            <Loader2 size={20} className="animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading payments...</span>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-12 text-center">
            <p className="text-sm text-destructive">{error}</p>
            <button
              onClick={loadPayments}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <PaymentHistoryTable payments={payments} />
        )}
      </div>
    </div>
  );
}
