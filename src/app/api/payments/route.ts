import { NextResponse } from "next/server";
import { paymentRecordSchema } from "@/lib/billing/payments";
import { applyPaymentToOccurrence } from "@/lib/billing/payments";
import { createDb } from "@/db/client";
import { paymentRecords, billOccurrences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit/log";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = paymentRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const userId = request.headers.get("x-mock-user-id") ?? "00000000-0000-0000-0000-000000000001";
    const db = createDb();

    const [inserted] = await db
      .insert(paymentRecords)
      .values({
        occurrenceId: parsed.data.occurrenceId,
        userId,
        paidAmountCents: parsed.data.paidAmountCents,
        paidCurrency: parsed.data.paidCurrency,
        paidDate: parsed.data.paidDate,
        method: parsed.data.method,
        note: parsed.data.note
      })
      .returning();

    if (!inserted) {
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }

    const [occurrence] = await db
      .select()
      .from(billOccurrences)
      .where(eq(billOccurrences.id, parsed.data.occurrenceId));

    if (occurrence) {
      const updated = applyPaymentToOccurrence(occurrence);
      await db
        .update(billOccurrences)
        .set({ status: updated.status, updatedAt: new Date() })
        .where(eq(billOccurrences.id, occurrence.id));
    }

    await logAuditEvent({
      userId,
      action: "recorded_payment",
      targetType: "payment",
      targetId: inserted.id
    });

    return NextResponse.json(
      { paymentId: inserted.id, occurrenceStatus: "paid" },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
