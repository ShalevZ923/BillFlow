import { describe, expect, it } from "vitest";
import { monthlyToYearly, yearlyToMonthly, percentageChange, totalFromCents } from "@/lib/calculator/financial";

describe("financial calculator", () => {
  it("converts monthly to yearly", () => {
    expect(monthlyToYearly(10000)).toBe(120000);
  });

  it("converts yearly to monthly", () => {
    expect(yearlyToMonthly(120000)).toBe(10000);
  });

  it("calculates percentage change", () => {
    expect(percentageChange(10000, 12000)).toBe(20);
    expect(percentageChange(10000, 8000)).toBe(-20);
  });

  it("calculates total from cents", () => {
    expect(totalFromCents([1000, 2000, 3000])).toBe(6000);
  });

  it("handles percentage change from zero (increase)", () => {
    expect(percentageChange(0, 10000)).toBe(100);
  });

  it("handles percentage change with both zeros", () => {
    expect(percentageChange(0, 0)).toBe(0);
  });

  it("handles total from empty array", () => {
    expect(totalFromCents([])).toBe(0);
  });

  it("handles total with negative amounts", () => {
    expect(totalFromCents([1000, -200, 300])).toBe(1100);
  });

  it("rounds yearly to monthly for non-divisible values", () => {
    expect(yearlyToMonthly(10000)).toBe(833);
  });
});
