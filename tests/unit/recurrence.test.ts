import { describe, expect, it } from "vitest";
import { generateOccurrences, markOverdue } from "@/lib/billing/recurrence";

describe("generateOccurrences", () => {
  it("generates monthly occurrences for 12 months and keeps unpaid past occurrences", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-01-31",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 12
    });

    expect(occurrences).toHaveLength(12);
    expect(occurrences[0]?.dueDate).toBe("2026-01-31");
    expect(occurrences[1]?.dueDate).toBe("2026-02-28");
    expect(occurrences[11]?.status).toBe("unpaid");
  });

  it("marks unpaid past occurrences overdue without touching future occurrences", () => {
    const result = markOverdue(
      [
        { id: "a", dueDate: "2026-05-01", status: "unpaid" },
        { id: "b", dueDate: "2026-06-01", status: "unpaid" },
        { id: "c", dueDate: "2026-05-01", status: "paid" }
      ],
      "2026-05-29"
    );

    expect(result.map((item) => item.status)).toEqual(["overdue", "unpaid", "paid"]);
  });
});
