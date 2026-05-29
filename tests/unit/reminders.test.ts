import { describe, expect, it } from "vitest";
import { selectReminderEvents } from "@/lib/notifications/reminders";

describe("selectReminderEvents", () => {
  it("selects 7-day, 1-day, and overdue reminders", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "seven", dueDate: "2026-06-05", status: "unpaid" },
        { id: "one", dueDate: "2026-05-30", status: "unpaid" },
        { id: "overdue", dueDate: "2026-05-20", status: "overdue" },
        { id: "paid", dueDate: "2026-06-01", status: "paid" }
      ]
    });

    expect(events.map((e) => e.type)).toEqual(["seven-day", "one-day", "overdue"]);
    expect(events).toHaveLength(3);
  });

  it("skips paid and skipped occurrences", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "a", dueDate: "2026-06-05", status: "paid" }
      ]
    });

    expect(events).toHaveLength(0);
  });
});
