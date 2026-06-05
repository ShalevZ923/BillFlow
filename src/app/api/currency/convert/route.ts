import { NextResponse } from "next/server";
import { z } from "zod";
import { supportedCurrencies } from "@/lib/billing/types";
import { convertToMany } from "@/lib/currency/conversion";
import { createDb } from "@/db/client";
import { exchangeRateSnapshots, profiles } from "@/db/schema";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { eq } from "drizzle-orm";

const convertSchema = z.object({
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/),
  from: z.enum(supportedCurrencies),
  targets: z.array(z.enum(supportedCurrencies)).min(1)
});

export async function POST(request: Request) {
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
      return NextResponse.json(
        { error: "Live currency converter requires Pro" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = convertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const [snapshot] = await db
      .select()
      .from(exchangeRateSnapshots)
      .where(eq(exchangeRateSnapshots.id, "global"));

    const rates = snapshot
      ? {
          base: snapshot.base,
          updatedAt: snapshot.updatedAt.toISOString(),
          rates: snapshot.rates as Record<typeof supportedCurrencies[number], number>
        }
      : {
          base: "USD" as const,
          updatedAt: new Date().toISOString(),
          rates: { USD: 1, EUR: 0.92, GBP: 0.79, ILS: 3.65 }
        };

    const amountCents = Math.round(parseFloat(parsed.data.amount) * 100);
    const results = convertToMany({
      amountCents,
      from: parsed.data.from,
      targets: parsed.data.targets,
      rates
    });

    return NextResponse.json({
      from: parsed.data.from,
      amountCents,
      results,
      ratesUpdatedAt: rates.updatedAt
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
