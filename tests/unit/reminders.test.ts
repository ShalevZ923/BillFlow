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
        { id: "a", dueDate: "2026-06-05", status: "paid" },
        { id: "b", dueDate: "2026-06-05", status: "skipped" }
      ]
    });

    expect(events).toHaveLength(0);
  });

  it("triggers overdue for unpaid items past due date", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "a", dueDate: "2026-05-25", status: "unpaid" }
      ]
    });

    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("overdue");
  });

  it("does not trigger for items due 0 days, 2 days, or 6 days from now", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "a", dueDate: "2026-05-29", status: "unpaid" },
        { id: "b", dueDate: "2026-05-31", status: "unpaid" },
        { id: "c", dueDate: "2026-06-04", status: "unpaid" }
      ]
    });

    expect(events).toHaveLength(0);
  });

  it("handles empty occurrences array", () => {
    expect(selectReminderEvents({ today: "2026-05-29", occurrences: [] })).toEqual([]);
  });

  it("does not double-trigger for overdue item that is also exactly 7 days before today", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "a", dueDate: "2026-05-22", status: "overdue" }
      ]
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.type).toBe("overdue");
  });
});
