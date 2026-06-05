import { NextResponse } from "next/server";
import { paymentRecordSchema } from "@/lib/billing/payments";
import { applyPaymentToOccurrence } from "@/lib/billing/payments";
import { createDb } from "@/db/client";
import { paymentRecords, billOccurrences } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logAuditEvent } from "@/lib/audit/log";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { rateLimitRequest } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rl = rateLimitRequest(request, 20);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const parsed = paymentRecordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const userId = user.id;
    const db = createDb();

    const [occurrence] = await db
      .select()
      .from(billOccurrences)
      .where(eq(billOccurrences.id, parsed.data.occurrenceId));

    if (!occurrence || occurrence.userId !== userId) {
      return NextResponse.json({ error: "Occurrence not found" }, { status: 404 });
    }

    const [inserted] = await db.transaction(async (tx) => {
      const [payment] = await tx
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

      if (!payment) {
        tx.rollback();
        return [];
      }

      const updated = applyPaymentToOccurrence(
        occurrence,
        parsed.data.paidAmountCents,
        occurrence.amountCents
      );
      if (updated.status !== occurrence.status) {
        await tx
          .update(billOccurrences)
          .set({ status: updated.status, updatedAt: new Date() })
          .where(eq(billOccurrences.id, occurrence.id));
      }

      return [payment];
    });

    if (!inserted) {
      return NextResponse.json({ error: "Failed to record payment" }, { status: 500 });
    }

    await logAuditEvent({
      userId,
      action: "recorded_payment",
      targetType: "payment",
      targetId: inserted.id
    });

    return NextResponse.json(
      {
        paymentId: inserted.id,
        occurrenceStatus: occurrence.status,
        paidInFull: occurrence.amountCents <= parsed.data.paidAmountCents
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Payment recording failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
