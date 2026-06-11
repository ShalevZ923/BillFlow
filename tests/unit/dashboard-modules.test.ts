import { describe, expect, it } from "vitest";
import { dashboardModuleRegistry, getDashboardModulesByZone } from "@/components/dashboard/modules/registry";

describe("dashboard module registry", () => {
  it("keeps the workflow command center modules in stable priority order", () => {
    expect(dashboardModuleRegistry.map((module) => module.id)).toEqual([
      "kpi-summary",
      "due-queue",
      "action-panel",
      "supporting-analytics",
      "recent-activity",
      "secondary-bills"
    ]);
  });

  it("groups modules by dashboard zone", () => {
    expect(getDashboardModulesByZone("kpi").map((module) => module.id)).toEqual(["kpi-summary"]);
    expect(getDashboardModulesByZone("main").map((module) => module.id)).toEqual(["due-queue"]);
    expect(getDashboardModulesByZone("rail").map((module) => module.id)).toEqual(["action-panel"]);
    expect(getDashboardModulesByZone("analytics").map((module) => module.id)).toEqual(["supporting-analytics"]);
    expect(getDashboardModulesByZone("secondary").map((module) => module.id)).toEqual([
      "recent-activity",
      "secondary-bills"
    ]);
  });

  it("declares explicit metadata for every module", () => {
    for (const definition of dashboardModuleRegistry) {
      expect(definition.title).not.toHaveLength(0);
      expect(definition.description).not.toHaveLength(0);
      expect(["kpi", "main", "rail", "analytics", "secondary"]).toContain(definition.zone);
      expect(["small", "medium", "wide", "rail", "full"]).toContain(definition.size);
      expect(definition.requiredData.length).toBeGreaterThan(0);
      expect(definition.component).toBeTypeOf("function");
    }
  });
});
