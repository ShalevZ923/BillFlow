import { NextResponse } from "next/server";
import { z } from "zod";
import { generateFillSuggestion } from "@/lib/ai/ai-fill";

const fillSchema = z.object({
  text: z.string().min(1, "Text is required").max(5000)
});

export async function POST(request: Request) {
  try {
    const plan = request.headers.get("x-mock-plan") ?? "free";

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
