"use client";

import { useCallback, useState } from "react";
import { BillsManagementSurface } from "@/components/bills/bills-management-surface";
import type { BillListItem } from "@/components/bills/bill-list";
import { getBills, type BillData } from "@/app/(app)/bills/actions";

type BillsPageClientProps = {
  initialBills: BillData[];
};

export function BillsPageClient({ initialBills }: BillsPageClientProps) {
  const [bills, setBills] = useState(initialBills);

  const refreshBills = useCallback(async () => {
    const nextBills = await getBills();
    setBills(nextBills);
  }, []);

  const handleBillCreated = useCallback((billItem: BillListItem) => {
    const newBill: BillData = {
      id: billItem.id,
      name: billItem.name,
      vendor: billItem.vendor ?? "",
      amountCents: billItem.amountCents,
      currency: billItem.currency,
      dueDate: billItem.dueDate,
      cycle: billItem.cycle ?? "monthly",
      category: billItem.category,
      priority: billItem.priority,
      status: billItem.status,
      tags: billItem.tags,
      notes: billItem.notes ?? ""
    };

    setBills((prev) => [newBill, ...prev]);
  }, []);

  return (
    <BillsManagementSurface
      bills={bills}
      onBillCreated={handleBillCreated}
      onBillsChanged={refreshBills}
    />
  );
}
