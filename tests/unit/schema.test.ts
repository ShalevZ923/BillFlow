import { describe, expect, it } from "vitest";
import { bills, billOccurrences, paymentRecords, profiles } from "@/db/schema";

describe("database schema", () => {
  it("defines the core user-owned tables", () => {
    expect(profiles).toBeDefined();
    expect(bills).toBeDefined();
    expect(billOccurrences).toBeDefined();
    expect(paymentRecords).toBeDefined();
  });
});
