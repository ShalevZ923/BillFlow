"use client";

import { useState } from "react";
import { PaymentForm, type PaymentFormValues } from "@/components/payments/payment-form";
import { PaymentHistoryTable, type PaymentRecord } from "@/components/payments/payment-history-table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const mockPayments: PaymentRecord[] = [
  {
    id: "pay-1",
    billName: "Adobe Creative Cloud",
    category: "SaaS",
    paidAmountCents: 5999,
    paidCurrency: "USD",
    paidDate: "2026-04-15",
    method: "card",
    note: "Paid from business card",
    status: "paid"
  },
  {
    id: "pay-2",
    billName: "Internet Provider",
    category: "Utilities",
    paidAmountCents: 8999,
    paidCurrency: "USD",
    paidDate: "2026-05-01",
    method: "bank",
    note: "",
    status: "paid"
  }
];

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>(mockPayments);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(data: PaymentFormValues) {
    setIsSubmitting(true);

    setTimeout(() => {
      const newPayment: PaymentRecord = {
        id: `pay-${Date.now()}`,
        billName: `Bill ${data.occurrenceId.slice(0, 8)}`,
        category: "Other",
        paidAmountCents: Math.round(parseFloat(data.paidAmount) * 100),
        paidCurrency: data.paidCurrency,
        paidDate: data.paidDate,
        method: data.method,
        note: data.note,
        status: "paid"
      };

      setPayments((prev) => [newPayment, ...prev]);
      setIsSubmitting(false);
      setShowForm(false);
    }, 500);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Payments</h1>
          <p className="mt-1 text-sm text-muted">Record and view payment history.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Record Payment
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <PaymentForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Card>
      )}

      <div className="mt-6">
        <PaymentHistoryTable payments={payments} />
      </div>
    </div>
  );
}
