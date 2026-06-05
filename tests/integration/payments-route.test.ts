import { describe, expect, it } from "vitest";
import { paymentRecordSchema, applyPaymentToOccurrence } from "@/lib/billing/payments";

describe("payment record logic", () => {
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
    expect(payment.paidCurrency).toBe("USD");
  });

  it("marks an occurrence paid when full amount is met", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "overdue" }, 5000, 5000)).toEqual({
      id: "occ-1",
      status: "paid"
    });

    expect(applyPaymentToOccurrence({ id: "occ-2", status: "unpaid" }, 10000, 10000)).toEqual({
      id: "occ-2",
      status: "paid"
    });
  });

  it("rejects invalid amount format", () => {
    const result = paymentRecordSchema.safeParse({
      occurrenceId: "00000000-0000-4000-8000-000000000001",
      paidAmount: "abc",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "card",
      note: ""
    });

    expect(result.success).toBe(false);
  });
});
