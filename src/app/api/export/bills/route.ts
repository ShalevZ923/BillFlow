import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills } from "@/db/schema";
import { generateBillCsv } from "@/lib/csv/import";
import type { CurrencyCode, BillingCycle, BillPriority, BillInput } from "@/lib/billing/types";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = createDb();

    const userBills = await db
      .select()
      .from(bills)
      .where(eq(bills.userId, user.id));

    const billInputs: BillInput[] = userBills.map((bill) => ({
      name: bill.name,
      vendor: bill.vendor ?? "",
      amountCents: bill.amountCents,
      currency: bill.currency as CurrencyCode,
      dueDate: String(bill.firstDueDate),
      cycle: bill.cycle as BillingCycle,
      category: bill.category,
      priority: bill.priority as BillPriority,
      status: "unpaid" as BillInput["status"],
      tags: bill.tags,
      notes: bill.notes
    }));

    const csv = generateBillCsv(billInputs);

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="bills-export.csv"'
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
