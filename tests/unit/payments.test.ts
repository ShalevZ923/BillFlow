import { describe, expect, it } from "vitest";
import { applyPaymentToOccurrence, paymentRecordSchema } from "@/lib/billing/payments";

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
});
