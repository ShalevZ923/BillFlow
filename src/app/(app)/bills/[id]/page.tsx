import { redirect } from "next/navigation";

type BillDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function BillDetailPage({ params }: BillDetailPageProps) {
  await params;
  redirect("/bills");
}
