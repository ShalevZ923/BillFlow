"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { BillsManagementSurface } from "@/components/bills/bills-management-surface";
import type { BillListItem } from "@/components/bills/bill-list";
import { getBills, type BillData } from "@/app/(app)/bills/actions";

type BillsPageClientProps = {
  initialBills: BillData[];
  initialSelectedBillId?: string | null;
};

export function BillsPageClient({ initialBills, initialSelectedBillId = null }: BillsPageClientProps) {
  const router = useRouter();
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

  const handleSelectedBillClosed = useCallback(() => {
    if (initialSelectedBillId) {
      router.replace("/bills");
    }
  }, [initialSelectedBillId, router]);

  return (
    <BillsManagementSurface
      key={initialSelectedBillId ?? "all-bills"}
      bills={bills}
      onBillCreated={handleBillCreated}
      onBillsChanged={refreshBills}
      initialSelectedBillId={initialSelectedBillId}
      onSelectedBillClosed={handleSelectedBillClosed}
    />
  );
}
