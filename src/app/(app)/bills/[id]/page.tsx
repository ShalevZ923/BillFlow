import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getBill } from "./actions";
import { BillDetailContent } from "./bill-detail-content";

type BillDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  const { id } = await params;
  const data = await getBill(id);

  if (!data) {
    return (
      <div>
        <Link
          href="/bills"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition mb-6"
        >
          <ArrowLeft size={16} />
          Back to Bills
        </Link>
        <div className="rounded-xl border border-border bg-white p-12 text-center dark:bg-card">
          <p className="text-muted-foreground">Bill not found or you don&apos;t have access.</p>
        </div>
      </div>
    );
  }

  return <BillDetailContent bill={data.bill} occurrences={data.occurrences} payments={data.payments} />;
}
