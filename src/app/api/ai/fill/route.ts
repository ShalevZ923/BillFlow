import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFillSuggestion } from "@/lib/ai/ai-fill";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

const fillSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000)
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
      return NextResponse.json({ error: "AI Fill requires Pro" }, { status: 403 });
    }

    const body = await request.json();
    const parsed = fillSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", issues: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const suggestion = await generateFillSuggestion(parsed.data.text);

    return NextResponse.json({ suggestion });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "AI Fill failed. Try again." },
      { status: 500 }
    );
  }
}
