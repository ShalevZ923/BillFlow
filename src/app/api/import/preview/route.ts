import { NextResponse } from "next/server";
import { parseBillCsv } from "@/lib/csv/import";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      return NextResponse.json({ error: "CSV import requires Pro" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const csvText = await file.text();
    const preview = parseBillCsv(csvText);

    return NextResponse.json(preview);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
