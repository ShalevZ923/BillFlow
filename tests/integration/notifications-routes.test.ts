import { describe, expect, it } from "vitest";
import { selectReminderEvents } from "@/lib/notifications/reminders";

describe("notifications route logic", () => {
  it("selects reminders for relevant occurrences", () => {
    const events = selectReminderEvents({
      today: "2026-06-01",
      occurrences: [
        { id: "a", dueDate: "2026-06-08", status: "unpaid" },
        { id: "b", dueDate: "2026-06-02", status: "unpaid" }
      ]
    });

    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe("seven-day");
    expect(events[1]?.type).toBe("one-day");
  });
});
