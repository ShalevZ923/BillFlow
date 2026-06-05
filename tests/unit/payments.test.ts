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

  it("marks an occurrence as paid when paid amount meets or exceeds the occurrence amount", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "overdue" }, 10000, 10000)).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("marks an unpaid occurrence as paid when full amount is paid", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "unpaid" }, 10000, 10000)).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("marks an occurrence as paid when overpaying", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "unpaid" }, 15000, 10000)).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });

  it("does NOT mark as paid when partial payment is made", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "unpaid" }, 5000, 10000)).toEqual({
      id: "occ-1",
      status: "unpaid"
    });
  });

  it("does NOT mark as paid when payment is zero", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "unpaid" }, 0, 10000)).toEqual({
      id: "occ-1",
      status: "unpaid"
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
