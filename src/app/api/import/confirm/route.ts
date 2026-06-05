import { NextResponse } from "next/server";
import { parseBillCsv } from "@/lib/csv/import";
import { createDb } from "@/db/client";
import { bills, billOccurrences, profiles } from "@/db/schema";
import { generateOccurrences } from "@/lib/billing/recurrence";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { rateLimitRequest } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";
import type { BillingCycle } from "@/lib/billing/types";

export async function POST(request: Request) {
  const rl = rateLimitRequest(request, 10);
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

    const db = createDb();
    const [profile] = await db
      .select({ plan: profiles.plan })
      .from(profiles)
      .where(eq(profiles.id, user.id));

    const plan = profile?.plan ?? "free";

    if (plan !== "pro") {
      return NextResponse.json({ error: "CSV import requires Pro" }, { status: 403 });
    }

    const body = await request.json();
    const csvText = body.csvText as string;

    if (!csvText) {
      return NextResponse.json({ error: "No CSV data provided" }, { status: 400 });
    }

    const userId = user.id;

    const preview = parseBillCsv(csvText);

    if (preview.errors.length > 0) {
      return NextResponse.json(
        { error: "Validation errors found", errors: preview.errors },
        { status: 400 }
      );
    }

    let imported = 0;
    for (const { bill: billRow } of preview.validRows) {
      const [inserted] = await db
        .insert(bills)
        .values({
          userId,
          name: billRow.name,
          amountCents: billRow.amountCents,
          currency: billRow.currency,
          firstDueDate: billRow.dueDate,
          cycle: billRow.cycle as BillingCycle,
          customCycleDays: undefined,
          category: billRow.category,
          priority: billRow.priority,
          tags: billRow.tags,
          notes: billRow.notes
        })
        .returning();

      if (inserted) {
        const occurrences = generateOccurrences({
          billId: inserted.id,
          userId,
          startDate: billRow.dueDate,
          cycle: billRow.cycle,
          amountCents: billRow.amountCents,
          currency: billRow.currency,
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
