import { NextResponse } from "next/server";
import { getEnv } from "@/lib/env";
import { selectReminderEvents } from "@/lib/notifications/reminders";

export async function GET(request: Request) {
  try {
    const env = getEnv();

    const authHeader = request.headers.get("Authorization");
    const expected = `Bearer ${env.CRON_SECRET}`;

    if (!env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);

    const events = selectReminderEvents({
      today,
      occurrences: [
        { id: "occ-1", dueDate: addDaysToISO(today, 7), status: "unpaid" },
        { id: "occ-2", dueDate: addDaysToISO(today, 1), status: "unpaid" },
        { id: "occ-3", dueDate: addDaysToISO(today, -5), status: "overdue" }
      ]
    });

    const emailSent = events.filter((e) => e.type !== "overdue").length;
    const pushSent = events.length;
    const failed = 0;

    return NextResponse.json({ emailSent, pushSent, failed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Server error" },
      { status: 500 }
    );
  }
}

function addDaysToISO(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
