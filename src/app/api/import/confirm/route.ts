import { NextResponse } from "next/server";
import { parseBillCsv } from "@/lib/csv/import";
import { createDb } from "@/db/client";
import { bills, billOccurrences } from "@/db/schema";
import { generateOccurrences } from "@/lib/billing/recurrence";
import type { BillingCycle } from "@/lib/billing/types";

export async function POST(request: Request) {
  try {
    const plan = request.headers.get("x-mock-plan") ?? "free";

    if (plan !== "pro") {
      return NextResponse.json({ error: "CSV import requires Pro" }, { status: 403 });
    }

    const body = await request.json();
    const csvText = body.csvText as string;

    if (!csvText) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    const userId = request.headers.get("x-mock-user-id") ?? "00000000-0000-0000-0000-000000000001";
    const db = createDb();

    const preview = parseBillCsv(csvText);

    if (preview.errors.length > 0) {
      return NextResponse.json(
        { error: "Validation errors found", errors: preview.errors },
        { status: 400 }
      );
    }

    let imported = 0;
    for (const { bill } of preview.validRows) {
      const [inserted] = await db
        .insert(bills)
        .values({
          userId,
          name: bill.name,
          amountCents: bill.amountCents,
          currency: bill.currency,
          firstDueDate: bill.dueDate,
          cycle: bill.cycle as BillingCycle,
          customCycleDays: undefined,
          category: bill.category,
          priority: bill.priority,
          tags: bill.tags,
          notes: bill.notes
        })
        .returning();

      if (inserted) {
        const occurrences = generateOccurrences({
          billId: inserted.id,
          userId,
          startDate: bill.dueDate,
          cycle: bill.cycle,
          amountCents: bill.amountCents,
          currency: bill.currency,
          monthsAhead: 12
        });

        if (occurrences.length > 0) {
          await db.insert(billOccurrences).values(occurrences).onConflictDoNothing();
        }

        imported++;
      }
    }

    return NextResponse.json({ imported });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
