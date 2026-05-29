import { describe, expect, it } from "vitest";
import { bills, billOccurrences, exchangeRateSnapshots, paymentRecords, profiles } from "@/db/schema";

describe("database schema", () => {
  it("defines the core application tables", () => {
    expect(profiles).toBeDefined();
    expect(bills).toBeDefined();
    expect(billOccurrences).toBeDefined();
    expect(paymentRecords).toBeDefined();
    expect(exchangeRateSnapshots).toBeDefined();
  });
});
