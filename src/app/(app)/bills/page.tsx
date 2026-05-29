"use client";

import { useState } from "react";
import { BillForm } from "@/components/bills/bill-form";
import { BillList, type BillListItem } from "@/components/bills/bill-list";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

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
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(data: Record<string, unknown>) {
    setIsSubmitting(true);

    setTimeout(() => {
      const newBill: BillListItem = {
        id: `bill-${Date.now()}`,
        name: String(data.name),
        amountCents: Math.round(parseFloat(String(data.amount)) * 100),
        currency: String(data.currency),
        dueDate: String(data.dueDate),
        category: String(data.category),
        priority: data.priority as BillListItem["priority"],
        status: data.status as BillListItem["status"],
        tags: String(data.tags)
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean)
      };

      setBills((prev) => [newBill, ...prev]);
      setIsSubmitting(false);
      setShowForm(false);
    }, 500);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Bills</h1>
          <p className="mt-1 text-sm text-muted">Manage your recurring and one-time bills.</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus size={16} />
          Add Bill
        </Button>
      </div>

      {showForm && (
        <Card className="mt-6">
          <BillForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </Card>
      )}

      <div className="mt-6">
        <BillList
          bills={bills}
          emptyStateText="Add your first bill to turn the dashboard into a useful financial picture."
        />
      </div>
    </div>
  );
}
