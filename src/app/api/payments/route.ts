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
      const updated = applyPaymentToOccurrence(
        occurrence,
        parsed.data.paidAmountCents,
        occurrence.amountCents
      );
      if (updated.status !== occurrence.status) {
        await db
          .update(billOccurrences)
          .set({ status: updated.status, updatedAt: new Date() })
          .where(eq(billOccurrences.id, occurrence.id));
      }
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
        occurrenceStatus: occurrence?.status ?? "unpaid",
        paidInFull: (occurrence?.amountCents ?? 0) <= parsed.data.paidAmountCents
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
