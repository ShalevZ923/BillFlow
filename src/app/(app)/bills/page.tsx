import { BillsPageClient } from "@/components/bills/bills-page-client";
import { getBills } from "./actions";

export default async function BillsPage() {
  const bills = await getBills();

  return <BillsPageClient initialBills={bills} />;
}
