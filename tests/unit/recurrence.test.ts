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

  it("handles one-time cycle returning exactly 1 occurrence", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-06-15",
      cycle: "one-time",
      amountCents: 5000,
      currency: "USD",
      monthsAhead: 12
    });

    expect(occurrences).toHaveLength(1);
    expect(occurrences[0]?.dueDate).toBe("2026-06-15");
  });

  it("generates yearly occurrences over 3 years", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-03-15",
      cycle: "yearly",
      amountCents: 12000,
      currency: "USD",
      monthsAhead: 3
    });

    expect(occurrences).toHaveLength(3);
    expect(occurrences[0]?.dueDate).toBe("2026-03-15");
    expect(occurrences[1]?.dueDate).toBe("2027-03-15");
    expect(occurrences[2]?.dueDate).toBe("2028-03-15");
  });

  it("generates custom cycle occurrences with explicit days", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-06-01",
      cycle: "custom",
      customCycleDays: 14,
      amountCents: 5000,
      currency: "USD",
      monthsAhead: 4
    });

    expect(occurrences).toHaveLength(4);
    expect(occurrences[0]?.dueDate).toBe("2026-06-01");
    expect(occurrences[1]?.dueDate).toBe("2026-06-15");
  });

  it("falls back to 30-day default for custom cycle without days", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-06-01",
      cycle: "custom",
      customCycleDays: null,
      amountCents: 5000,
      currency: "USD",
      monthsAhead: 2
    });

    expect(occurrences).toHaveLength(2);
    expect(occurrences[0]?.dueDate).toBe("2026-06-01");
    expect(occurrences[1]?.dueDate).toBe("2026-07-01");
  });

  it("handles leap-year February month-end (Jan 31 -> Feb 29)", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2028-01-31",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 2
    });

    expect(occurrences[0]?.dueDate).toBe("2028-01-31");
    expect(occurrences[1]?.dueDate).toBe("2028-02-29");
  });

  it("handles March 31 -> April 30 month-end roll", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-03-31",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 2
    });

    expect(occurrences[0]?.dueDate).toBe("2026-03-31");
    expect(occurrences[1]?.dueDate).toBe("2026-04-30");
  });

  it("handles December 31 month-end crossing into next year", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-12-31",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 3
    });

    expect(occurrences[0]?.dueDate).toBe("2026-12-31");
    expect(occurrences[1]?.dueDate).toBe("2027-01-31");
    expect(occurrences[2]?.dueDate).toBe("2027-02-28");
  });

  it("returns empty array for monthsAhead 0", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-06-01",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 0
    });

    expect(occurrences).toHaveLength(0);
  });

  it("handles one-time with monthsAhead 0", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-06-01",
      cycle: "one-time",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 0
    });

    expect(occurrences).toHaveLength(1);
  });
});

describe("markOverdue", () => {
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

  it("does not mark items due today as overdue", () => {
    const result = markOverdue(
      [{ id: "a", dueDate: "2026-05-29", status: "unpaid" }],
      "2026-05-29"
    );

    expect(result[0]?.status).toBe("unpaid");
  });

  it("keeps already-overdue items as overdue", () => {
    const result = markOverdue(
      [{ id: "a", dueDate: "2026-05-01", status: "overdue" }],
      "2026-05-29"
    );

    expect(result[0]?.status).toBe("overdue");
  });

  it("returns empty array unchanged", () => {
    expect(markOverdue([], "2026-05-29")).toEqual([]);
  });

  it("does not change paid or skipped items", () => {
    const result = markOverdue(
      [
        { id: "a", dueDate: "2026-05-01", status: "paid" }
      ],
      "2026-05-29"
    );

    expect(result[0]?.status).toBe("paid");
  });

  it("marks unpaid overdue even if due date is far in the past", () => {
    const result = markOverdue(
      [{ id: "a", dueDate: "2024-01-01", status: "unpaid" }],
      "2026-05-29"
    );

    expect(result[0]?.status).toBe("overdue");
  });
});
