import { NextResponse } from "next/server";
import { eq, or, inArray } from "drizzle-orm";
import { getEnv } from "@/lib/env";
import { createDb } from "@/db/client";
import { bills, billOccurrences, profiles, pushSubscriptions } from "@/db/schema";
import { selectReminderEvents } from "@/lib/notifications/reminders";
import { sendReminderEmail } from "@/lib/notifications/email";
import { sendPushReminder } from "@/lib/notifications/push";

const maxRetries = 3;

export async function GET(request: Request) {
  try {
    const env = getEnv();

    const authHeader = request.headers.get("Authorization");
    const expected = `Bearer ${env.CRON_SECRET}`;

    if (!env.CRON_SECRET || authHeader !== expected) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const today = new Date().toISOString().slice(0, 10);
    const db = createDb();

    const occurrenceRows = await db
      .select()
      .from(billOccurrences)
      .where(
        or(
          eq(billOccurrences.status, "unpaid"),
          eq(billOccurrences.status, "overdue")
        )
      );

    const events = selectReminderEvents({
      today,
      occurrences: occurrenceRows.map((o) => ({
        id: o.id,
        dueDate: String(o.dueDate),
        status: o.status
      }))
    });

    if (events.length === 0) {
      return NextResponse.json({ emailSent: 0, pushSent: 0, failed: 0 });
    }

    const eventMap = new Map(events.map((e) => [e.occurrenceId, e]));
    const relevantOccurrences = occurrenceRows.filter((o) => eventMap.has(o.id));
    const billIds = [...new Set(relevantOccurrences.map((o) => o.billId))];
    const userIds = [...new Set(relevantOccurrences.map((o) => o.userId))];

    const [billRows, profileRows, subscriptionRows] = await Promise.all([
      db.select().from(bills).where(inArray(bills.id, billIds)),
      db.select().from(profiles).where(inArray(profiles.id, userIds)),
      db.select().from(pushSubscriptions).where(inArray(pushSubscriptions.userId, userIds))
    ]);

    const billMap = new Map(billRows.map((b) => [b.id, b]));
    const profileMap = new Map(profileRows.map((p) => [p.id, p]));
    const subsByUser = new Map<string, typeof subscriptionRows>();
    for (const sub of subscriptionRows) {
      const list = subsByUser.get(sub.userId) ?? [];
      list.push(sub);
      subsByUser.set(sub.userId, list);
    }

    let emailSent = 0;
    let pushSent = 0;
    let failed = 0;

    for (const occ of relevantOccurrences) {
      try {
        const event = eventMap.get(occ.id);
        if (!event) continue;

        const bill = billMap.get(occ.billId);
        const profile = profileMap.get(occ.userId);

        const billName = bill?.name ?? "Unknown Bill";
        const amountLabel = `${(occ.amountCents / 100).toFixed(2)} ${occ.currency}`;

        if (profile?.emailRemindersEnabled && profile.email) {
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              await sendReminderEmail({
                to: profile.email,
                billName,
                dueDate: String(occ.dueDate),
                amountLabel,
                type: event.type
              });
              emailSent++;
              break;
            } catch (err) {
              if (attempt === maxRetries - 1) {
                console.error(`Failed to send email reminder for ${occ.id}:`, err);
                failed++;
              }
            }
          }
        }

        if (profile?.pushRemindersEnabled) {
          const userSubs = subsByUser.get(occ.userId) ?? [];
          for (const sub of userSubs) {
            for (let attempt = 0; attempt < maxRetries; attempt++) {
              try {
                await sendPushReminder({
                  subscription: {
                    endpoint: sub.endpoint,
                    p256dh: sub.p256dh,
                    auth: sub.auth
                  },
                  title: "BillFlow Reminder",
                  body: `${billName} due ${String(occ.dueDate)}`
                });
                pushSent++;
                break;
              } catch (err) {
                if (attempt === maxRetries - 1) {
                  console.error(`Failed to send push reminder for ${occ.id}:`, err);
                  failed++;
                }
              }
            }
          }
        }
      } catch (err) {
        console.error(`Failed to process reminder for occurrence ${occ.id}:`, err);
        failed++;
      }
    }

    return NextResponse.json({ emailSent, pushSent, failed });
  } catch (error) {
    console.error("Reminders cron failed:", error instanceof Error ? error.message : error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
