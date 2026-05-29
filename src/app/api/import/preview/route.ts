import { NextResponse } from "next/server";
import { parseBillCsv } from "@/lib/csv/import";

export async function POST(request: Request) {
  try {
    const plan = request.headers.get("x-mock-plan") ?? "free";

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
