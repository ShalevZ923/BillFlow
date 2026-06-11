import { BillsPageClient } from "@/components/bills/bills-page-client";
import { getBills } from "./actions";

type BillsPageProps = {
  searchParams?: Promise<{ bill?: string }>;
};

export default async function BillsPage({ searchParams }: BillsPageProps) {
  const params = await searchParams;
  const bills = await getBills();

  return <BillsPageClient initialBills={bills} initialSelectedBillId={params?.bill ?? null} />;
}
