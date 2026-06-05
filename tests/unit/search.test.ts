import { describe, expect, it } from "vitest";
import { getUniqueCategories, getUniqueTags } from "@/lib/dashboard/filters";
import type { FilterableBill } from "@/lib/dashboard/filters";

describe("dashboard filters: category and tag extraction", () => {
  const sampleBills: FilterableBill[] = [
    { id: "1", name: "AWS", category: "Cloud", priority: "high", tags: ["infra", "cloud"], cycle: "monthly", occurrences: [] },
    { id: "2", name: "Rent", category: "Rent", priority: "critical", tags: ["office"], cycle: "monthly", occurrences: [] },
    { id: "3", name: "Gmail", category: "SaaS", priority: "medium", tags: ["email"], cycle: "monthly", occurrences: [] },
    { id: "4", name: "ISP", category: "Utilities", priority: "low", tags: ["internet"], cycle: "monthly", occurrences: [] },
    { id: "5", name: "Domain", category: "SaaS", priority: "low", tags: ["domains", "email"], cycle: "yearly", occurrences: [] }
  ];

  it("extracts unique categories", () => {
    const categories = getUniqueCategories(sampleBills);
    expect(categories).toHaveLength(4);
    expect(categories).toContain("Cloud");
    expect(categories).toContain("Rent");
    expect(categories).toContain("SaaS");
    expect(categories).toContain("Utilities");
  });

  it("extracts unique tags", () => {
    const tags = getUniqueTags(sampleBills);
    expect(tags).toHaveLength(6);
    expect(tags).toContain("cloud");
    expect(tags).toContain("domains");
    expect(tags).toContain("email");
    expect(tags).toContain("infra");
    expect(tags).toContain("internet");
  });

  it("returns empty arrays for empty input", () => {
    expect(getUniqueCategories([])).toEqual([]);
    expect(getUniqueTags([])).toEqual([]);
  });

  it("handles single bill", () => {
    const single = [{ id: "1", name: "X", category: "Test", priority: "low", tags: ["a", "b"], cycle: "monthly", occurrences: [] }] as FilterableBill[];
    expect(getUniqueCategories(single)).toEqual(["Test"]);
    expect(getUniqueTags(single)).toEqual(["a", "b"]);
  });
});
