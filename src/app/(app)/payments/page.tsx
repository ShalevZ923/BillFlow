"use client";

import { useState } from "react";
import { RecordPaymentDialog, type PaymentRecord } from "@/components/payments/record-payment-dialog";
import { PaymentHistoryTable } from "@/components/payments/payment-history-table";

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

  function handlePaymentRecorded(payment: PaymentRecord) {
    setPayments((prev) => [payment, ...prev]);
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
        <PaymentHistoryTable payments={payments} />
      </div>
    </div>
  );
}
