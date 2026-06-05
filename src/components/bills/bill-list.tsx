"use client";

import { useMemo } from "react";
import { BillCard } from "@/components/bills/bill-card";
import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";

export type BillListItem = {
  id: string;
  name: string;
  amountCents: number;
  currency: string;
  dueDate: string;
  category: string;
  priority: BillPriority;
  status: OccurrenceStatus;
  tags: string[];
};

type BillListProps = {
  bills: BillListItem[];
  emptyStateText: string;
  searchQuery?: string;
};

export function BillList({ bills, emptyStateText, searchQuery }: BillListProps) {
  const filtered = useMemo(() => {
    if (!searchQuery) return bills;
    const q = searchQuery.toLowerCase();
    return bills.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [bills, searchQuery]);

  if (bills.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center">
          <p className="text-muted-foreground">{emptyStateText}</p>
      </div>
    );
  }

  if (filtered.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-8 text-center">
        <p className="text-sm text-muted-foreground">No bills match your search.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map((bill) => (
        <BillCard key={bill.id} id={bill.id} name={bill.name} amountCents={bill.amountCents} currency={bill.currency} dueDate={bill.dueDate} category={bill.category} priority={bill.priority} status={bill.status} tags={bill.tags} />
      ))}
    </div>
  );
}
