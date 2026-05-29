import { differenceInDays, parseISO } from "date-fns";

export type OccurrenceStub = {
  id: string;
  dueDate: string;
  status: "unpaid" | "paid" | "skipped" | "overdue";
};

export type ReminderEvent = {
  occurrenceId: string;
  dueDate: string;
  type: "seven-day" | "one-day" | "overdue";
};

export function selectReminderEvents(input: {
  today: string;
  occurrences: OccurrenceStub[];
}): ReminderEvent[] {
  const todayDate = parseISO(input.today);
  const events: ReminderEvent[] = [];

  for (const occurrence of input.occurrences) {
    if (occurrence.status === "paid" || occurrence.status === "skipped") {
      continue;
    }

    const dueDate = parseISO(occurrence.dueDate);
    const daysUntilDue = differenceInDays(dueDate, todayDate);

    if (daysUntilDue === 7) {
      events.push({ occurrenceId: occurrence.id, dueDate: occurrence.dueDate, type: "seven-day" });
    }

    if (daysUntilDue === 1) {
      events.push({ occurrenceId: occurrence.id, dueDate: occurrence.dueDate, type: "one-day" });
    }

    if (occurrence.status === "overdue" || (occurrence.status === "unpaid" && daysUntilDue < 0)) {
      events.push({ occurrenceId: occurrence.id, dueDate: occurrence.dueDate, type: "overdue" });
    }
  }

  return events;
}
