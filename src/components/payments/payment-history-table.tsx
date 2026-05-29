"use client";

import { Badge } from "@/components/ui/badge";

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

type PaymentHistoryTableProps = {
  payments: PaymentRecord[];
};

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  if (payments.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center">
        <p className="text-muted-foreground">No payment records yet. Record a payment to track paid bills.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-border bg-background text-xs font-medium uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Bill</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Amount</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Method</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Note</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {payments.map((payment) => (
            <tr key={payment.id} className="hover:bg-background/50">
              <td className="px-4 py-3 font-medium">{payment.billName}</td>
              <td className="px-4 py-3 text-muted-foreground">{payment.category}</td>
              <td className="px-4 py-3 font-semibold">
                {payment.paidCurrency} {formatCents(payment.paidAmountCents)}
              </td>
              <td className="px-4 py-3 text-muted-foreground">{payment.paidDate}</td>
              <td className="px-4 py-3">
                <Badge>{payment.method}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant="success">{payment.status}</Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground max-w-[200px] truncate">
                {payment.note || "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
