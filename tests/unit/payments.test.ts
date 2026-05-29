import { describe, expect, it } from "vitest";
import { paymentRecordSchema, applyPaymentToOccurrence } from "@/lib/billing/payments";

describe("payment records", () => {
  it("validates payment details", () => {
    const payment = paymentRecordSchema.parse({
      occurrenceId: "00000000-0000-4000-8000-000000000001",
      paidAmount: "99.99",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "card",
      note: "Paid from business card"
    });

    expect(payment.paidAmountCents).toBe(9999);
  });

  it("marks an occurrence paid without deleting history", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "overdue" })).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("marks an unpaid occurrence as paid", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "unpaid" })).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("marks an already-paid occurrence as paid again", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "paid" })).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("marks a skipped occurrence as paid", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "skipped" })).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("rejects invalid occurrenceId format", () => {
    const result = paymentRecordSchema.safeParse({
      occurrenceId: "not-a-uuid",
      paidAmount: "99.99",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "card",
      note: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects unsupported payment method", () => {
    const result = paymentRecordSchema.safeParse({
      occurrenceId: "00000000-0000-4000-8000-000000000001",
      paidAmount: "99.99",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "crypto",
      note: ""
    });

    expect(result.success).toBe(false);
  });

  it("rejects note exceeding 1000 characters", () => {
    const result = paymentRecordSchema.safeParse({
      occurrenceId: "00000000-0000-4000-8000-000000000001",
      paidAmount: "99.99",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "card",
      note: "x".repeat(1001)
    });

    expect(result.success).toBe(false);
  });

  it("accepts zero paid amount (for adjustments)", () => {
    const result = paymentRecordSchema.safeParse({
      occurrenceId: "00000000-0000-4000-8000-000000000001",
      paidAmount: "0.00",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "card",
      note: ""
    });

    expect(result.success).toBe(true);
  });
});
