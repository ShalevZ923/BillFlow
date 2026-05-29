import { NextResponse } from "next/server";
import { exportBillsToCsv } from "@/lib/csv/export";

export async function GET() {
  try {
    // Placeholder: in production, load user bills from DB
    const exportedBills = [
      {
        name: "Example Bill",
        amountCents: 10000,
        currency: "USD" as const,
        dueDate: "2026-06-15",
        cycle: "monthly" as const,
        category: "Other",
        priority: "medium" as const,
        status: "unpaid" as const,
        tags: ["example"],
        notes: "Sample export"
      }
    ];

    const csv = exportBillsToCsv(exportedBills);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="billflow-export.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
