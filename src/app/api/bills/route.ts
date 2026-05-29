import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { billInputSchema } from "@/lib/billing/validation";
import { canCreateBill, type Plan } from "@/lib/plans/limits";
import { generateOccurrences } from "@/lib/billing/recurrence";
import { createDb } from "@/db/client";
import { bills, billOccurrences } from "@/db/schema";
import type { BillingCycle } from "@/lib/billing/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const parsed = billInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid bill", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // In production, derive userId from Supabase session.
    // For MVP scaffolding, accept a temporary mock header.
    const userId = request.headers.get("x-mock-user-id") ?? "00000000-0000-0000-0000-000000000001";
    const plan: Plan = (request.headers.get("x-mock-plan") as Plan | null) ?? "free";

    const db = createDb();

    const currentBillCount = await db.$count(bills, sql`1=1`);
    const limit = canCreateBill({ plan, currentBillCount });
    if (!limit.allowed) {
      return NextResponse.json({ error: limit.reason }, { status: 402 });
    }

    const [inserted] = await db
      .insert(bills)
      .values({
        userId,
        name: parsed.data.name,
        amountCents: parsed.data.amountCents,
        currency: parsed.data.currency,
        firstDueDate: parsed.data.dueDate,
        cycle: parsed.data.cycle as BillingCycle,
        customCycleDays: undefined,
        category: parsed.data.category,
        priority: parsed.data.priority,
        tags: parsed.data.tags,
        notes: parsed.data.notes
      })
      .returning();

    if (!inserted) {
      return NextResponse.json({ error: "Failed to create bill" }, { status: 500 });
    }

    const occurrences = generateOccurrences({
      billId: inserted.id,
      userId,
      startDate: parsed.data.dueDate,
      cycle: parsed.data.cycle,
      customCycleDays: undefined,
      amountCents: parsed.data.amountCents,
      currency: parsed.data.currency,
      monthsAhead: 12
    });

    if (occurrences.length > 0) {
      await db.insert(billOccurrences).values(occurrences).onConflictDoNothing();
    }

    return NextResponse.json({ billId: inserted.id, occurrenceCount: occurrences.length }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
