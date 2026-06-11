import type { OccurrenceStatus } from "@/lib/billing/types";

type StatusOccurrence = {
  dueDate: string;
  status: OccurrenceStatus;
};

const derivedStatusPriority: Record<OccurrenceStatus, number> = {
  overdue: 0,
  unpaid: 1,
  skipped: 2,
  paid: 3
};

function statusForDate(occurrence: StatusOccurrence, today: string): OccurrenceStatus {
  if (occurrence.status === "unpaid" && occurrence.dueDate < today) {
    return "overdue";
  }

  return occurrence.status;
}

function compareOccurrences<T extends StatusOccurrence>(today: string) {
  return (a: T, b: T) => {
    const aStatus = statusForDate(a, today);
    const bStatus = statusForDate(b, today);
    const statusDiff = derivedStatusPriority[aStatus] - derivedStatusPriority[bStatus];

    if (statusDiff !== 0) return statusDiff;

    return a.dueDate.localeCompare(b.dueDate);
  };
}

export function selectPrimaryOccurrence<T extends StatusOccurrence>(
  occurrences: T[],
  today: string
): T | undefined {
  return [...occurrences].sort(compareOccurrences(today))[0];
}

export function deriveBillStatus<T extends StatusOccurrence>(occurrences: T[], today: string): OccurrenceStatus {
  const primary = selectPrimaryOccurrence(occurrences, today);

  if (!primary) return "unpaid";

  const primaryStatus = statusForDate(primary, today);

  if (primaryStatus === "skipped" && occurrences.some((occurrence) => occurrence.status === "paid")) {
    return "paid";
  }

  return primaryStatus;
}
