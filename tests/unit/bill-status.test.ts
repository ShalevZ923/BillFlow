import { describe, expect, it } from "vitest";
import { deriveBillStatus, selectPrimaryOccurrence } from "@/lib/billing/status";
import type { OccurrenceStatus } from "@/lib/billing/types";

type TestOccurrence = {
  id: string;
  dueDate: string;
  status: OccurrenceStatus;
};

describe("bill status derivation", () => {
  it("prioritizes overdue occurrence state over paid future occurrences", () => {
    const occurrences: TestOccurrence[] = [
      { id: "future-paid", dueDate: "2026-06-20", status: "paid" },
      { id: "past-unpaid", dueDate: "2026-06-01", status: "unpaid" }
    ];

    expect(deriveBillStatus(occurrences, "2026-06-11")).toBe("overdue");
    expect(selectPrimaryOccurrence(occurrences, "2026-06-11")?.id).toBe("past-unpaid");
  });

  it("uses the next unpaid occurrence before completed history", () => {
    const occurrences: TestOccurrence[] = [
      { id: "paid-history", dueDate: "2026-06-01", status: "paid" },
      { id: "next-unpaid", dueDate: "2026-06-15", status: "unpaid" }
    ];

    expect(deriveBillStatus(occurrences, "2026-06-11")).toBe("unpaid");
    expect(selectPrimaryOccurrence(occurrences, "2026-06-11")?.id).toBe("next-unpaid");
  });

  it("returns paid only when every occurrence is completed", () => {
    expect(
      deriveBillStatus(
        [
          { id: "paid-1", dueDate: "2026-06-01", status: "paid" },
          { id: "skipped-1", dueDate: "2026-06-15", status: "skipped" }
        ],
        "2026-06-11"
      )
    ).toBe("paid");
  });
});
