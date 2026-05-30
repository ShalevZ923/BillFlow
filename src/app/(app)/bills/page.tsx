"use client";

import { useState } from "react";
import { CreateBillDialog } from "@/components/bills/create-bill-dialog";
import { BillList, type BillListItem } from "@/components/bills/bill-list";

const mockBills: BillListItem[] = [
  {
    id: "bill-1",
    name: "AWS Invoice",
    amountCents: 12050,
    currency: "USD",
    dueDate: "2026-06-15",
    category: "Cloud",
    priority: "medium",
    status: "unpaid",
    tags: ["cloud", "infrastructure"]
  },
  {
    id: "bill-2",
    name: "Office Rent",
    amountCents: 280000,
    currency: "USD",
    dueDate: "2026-06-01",
    category: "Rent",
    priority: "critical",
    status: "unpaid",
    tags: ["office"]
  },
  {
    id: "bill-3",
    name: "GitHub Teams",
    amountCents: 8400,
    currency: "USD",
    dueDate: "2026-05-01",
    category: "SaaS",
    priority: "medium",
    status: "overdue",
    tags: ["dev"]
  }
];

export default function BillsPage() {
  const [bills, setBills] = useState<BillListItem[]>(mockBills);

  function handleBillCreated(bill: BillListItem) {
    setBills((prev) => [bill, ...prev]);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bills</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your recurring and one-time bills.</p>
        </div>
        <CreateBillDialog onBillCreated={handleBillCreated} />
      </div>

      <div className="mt-6">
        <BillList
          bills={bills}
          emptyStateText="Add your first bill to turn the dashboard into a useful financial picture."
        />
      </div>
    </div>
  );
}
