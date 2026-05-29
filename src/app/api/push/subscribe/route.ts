import { NextResponse } from "next/server";
import { createDb } from "@/db/client";
import { pushSubscriptions } from "@/db/schema";
import { z } from "zod";

const subscribeSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string()
  })
});

export async function POST(request: Request) {
  try {
    const userId = request.headers.get("x-mock-user-id") ?? "00000000-0000-0000-0000-000000000001";

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
    }

    const db = createDb();

    await db.insert(pushSubscriptions).values({
      userId,
      endpoint: parsed.data.endpoint,
      p256dh: parsed.data.keys.p256dh,
      auth: parsed.data.keys.auth
    });

    return NextResponse.json({ subscribed: true }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}
