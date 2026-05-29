"use client";

import { useState, useMemo } from "react";
import { BillCard } from "@/components/bills/bill-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
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
};

export function BillList({ bills, emptyStateText }: BillListProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search) return bills;
    const q = search.toLowerCase();
    return bills.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.category.toLowerCase().includes(q) ||
        b.tags.some((t) => t.toLowerCase().includes(q))
    );
  }, [bills, search]);

  if (bills.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-white p-12 text-center">
          <p className="text-muted-foreground">{emptyStateText}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-white p-8 text-center">
          <p className="text-sm text-muted-foreground">No bills match your search.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((bill) => (
            <BillCard key={bill.id} {...bill} />
          ))}
        </div>
      )}
    </div>
  );
}
