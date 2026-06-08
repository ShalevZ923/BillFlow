# Modular Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor BillFlow's dashboard into a light, workflow-first modular command center that can grow with future modules such as Payment Calendar.

**Architecture:** Keep the screenshot-inspired visual language while introducing a dashboard module registry, module-friendly data helpers, and fixed layout zones. The dashboard page arranges modules; each module owns its own rendering, empty state, and primary action.

**Tech Stack:** Next.js 16 app router, React 19, TypeScript 6, Tailwind CSS 4, shadcn-style local UI primitives, lucide-react, Vitest, Playwright.

---

## Scope

This plan implements the first modular dashboard iteration from `docs/superpowers/specs/2026-06-08-modular-dashboard-redesign.md`.

It does not add drag-and-drop customization, a real payment calendar, new billing APIs, or new payment processing behavior. It creates the modular dashboard foundation and ships a redesigned dashboard using existing data.

## File Structure

Create:

- `src/components/dashboard/modules/types.ts`
  - Shared dashboard module types, zone names, module sizes, module context shape, and lightweight module props.
- `src/components/dashboard/modules/registry.ts`
  - Static module registry used by the dashboard layout.
- `src/components/dashboard/modules/module-card.tsx`
  - Shared card wrapper for dashboard modules.
- `src/components/dashboard/modules/kpi-summary-module.tsx`
  - Operational KPI row.
- `src/components/dashboard/modules/due-queue-module.tsx`
  - Primary workflow list of overdue and due-soon occurrences.
- `src/components/dashboard/modules/action-panel-module.tsx`
  - Right-rail next-action module.
- `src/components/dashboard/modules/supporting-analytics-module.tsx`
  - Composes existing category and monthly chart modules in the analytics zone.
- `src/components/dashboard/modules/recent-activity-module.tsx`
  - Replaces inline recent activity rendering.
- `src/components/dashboard/modules/secondary-bills-module.tsx`
  - Small recent-bills preview and link to `/bills`, replacing the large all-bills grid on the dashboard.
- `src/components/dashboard/modules/dashboard-module-layout.tsx`
  - Fixed modular zone layout.
- `tests/unit/dashboard-modules.test.ts`
  - Registry and module-data behavior tests.

Modify:

- `src/lib/dashboard/aggregate.ts`
  - Add due queue and paid month-to-date data to the dashboard payload.
- `tests/unit/dashboard-aggregate.test.ts`
  - Add tests for due queue ordering, overdue inclusion, due-today inclusion, and paid month-to-date.
- `src/app/(app)/dashboard/dashboard-content.tsx`
  - Replace inline dashboard layout with modular layout composition.
- `tests/e2e/dashboard.spec.ts`
  - Update dashboard expectations to match the modular command-center dashboard.

---

## Task 1: Add Dashboard Module Registry Types

**Files:**

- Create: `src/components/dashboard/modules/types.ts`
- Create: `src/components/dashboard/modules/registry.ts`
- Test: `tests/unit/dashboard-modules.test.ts`

- [ ] **Step 1: Write the failing registry tests**

Create `tests/unit/dashboard-modules.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { dashboardModuleRegistry, getDashboardModulesByZone } from "@/components/dashboard/modules/registry";

describe("dashboard module registry", () => {
  it("contains stable module ids in priority order", () => {
    expect(dashboardModuleRegistry.map((module) => module.id)).toEqual([
      "kpi-summary",
      "due-queue",
      "action-panel",
      "supporting-analytics",
      "recent-activity",
      "secondary-bills"
    ]);
  });

  it("groups modules by zone and sorts by priority", () => {
    expect(getDashboardModulesByZone("kpi").map((module) => module.id)).toEqual(["kpi-summary"]);
    expect(getDashboardModulesByZone("main").map((module) => module.id)).toEqual(["due-queue"]);
    expect(getDashboardModulesByZone("rail").map((module) => module.id)).toEqual(["action-panel"]);
    expect(getDashboardModulesByZone("analytics").map((module) => module.id)).toEqual(["supporting-analytics"]);
    expect(getDashboardModulesByZone("secondary").map((module) => module.id)).toEqual([
      "recent-activity",
      "secondary-bills"
    ]);
  });

  it("keeps module metadata explicit for future modules", () => {
    for (const module of dashboardModuleRegistry) {
      expect(module.id.length).toBeGreaterThan(0);
      expect(module.title.length).toBeGreaterThan(0);
      expect(["kpi", "main", "rail", "analytics", "secondary"]).toContain(module.zone);
      expect(["small", "medium", "wide", "rail", "full"]).toContain(module.size);
      expect(module.requiredData.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
pnpm vitest run tests/unit/dashboard-modules.test.ts
```

Expected: fail because `src/components/dashboard/modules/registry.ts` does not exist.

- [ ] **Step 3: Add module types**

Create `src/components/dashboard/modules/types.ts`:

```ts
import type { ComponentType } from "react";
import type { BillPriority, CurrencyCode, OccurrenceStatus } from "@/lib/billing/types";
import type { DashboardPayload } from "@/lib/dashboard/aggregate";
import type { BillListItem } from "@/components/bills/bill-list";

export type DashboardModuleSize = "small" | "medium" | "wide" | "rail" | "full";

export type DashboardZone = "kpi" | "main" | "rail" | "analytics" | "secondary";

export type DashboardActivityItem = {
  id: string;
  action: string;
  billName: string;
  amountCents: number;
  date: string;
};

export type DashboardDueQueueItem = {
  id: string;
  billId: string;
  name: string;
  vendor: string;
  category: string;
  priority: BillPriority;
  tags: string[];
  dueDate: string;
  amountCents: number;
  currency: CurrencyCode;
  status: OccurrenceStatus;
  daysUntilDue: number;
};

export type DashboardModuleContext = {
  payload: DashboardPayload;
  bills: BillListItem[];
  activityItems: DashboardActivityItem[];
  dueQueueItems: DashboardDueQueueItem[];
  currency: CurrencyCode;
  onRefresh: () => void;
};

export type DashboardModuleProps = {
  context: DashboardModuleContext;
};

export type DashboardModuleDefinition = {
  id: string;
  title: string;
  description: string;
  zone: DashboardZone;
  size: DashboardModuleSize;
  priority: number;
  requiredData: string[];
  component: ComponentType<DashboardModuleProps>;
};
```

- [ ] **Step 4: Add registry with a deliberate no-op registered component**

Create `src/components/dashboard/modules/registry.ts`:

```ts
import type { DashboardModuleDefinition, DashboardModuleProps, DashboardZone } from "@/components/dashboard/modules/types";

function EmptyRegisteredModule({ context }: DashboardModuleProps) {
  void context;
  return null;
}

export const dashboardModuleRegistry: DashboardModuleDefinition[] = [
  {
    id: "kpi-summary",
    title: "Operational summary",
    description: "Top-level due, overdue, paid, and projection metrics.",
    zone: "kpi",
    size: "full",
    priority: 10,
    requiredData: ["summary"],
    component: EmptyRegisteredModule
  },
  {
    id: "due-queue",
    title: "Due queue",
    description: "Primary workflow module for overdue and due-soon bills.",
    zone: "main",
    size: "wide",
    priority: 10,
    requiredData: ["dueQueue"],
    component: EmptyRegisteredModule
  },
  {
    id: "action-panel",
    title: "Action panel",
    description: "Right-rail next actions and operational guidance.",
    zone: "rail",
    size: "rail",
    priority: 10,
    requiredData: ["summary", "dueQueue", "activity"],
    component: EmptyRegisteredModule
  },
  {
    id: "supporting-analytics",
    title: "Supporting analytics",
    description: "Category and monthly breakdowns below the workflow.",
    zone: "analytics",
    size: "full",
    priority: 10,
    requiredData: ["categoryTotals", "monthlyBreakdown"],
    component: EmptyRegisteredModule
  },
  {
    id: "recent-activity",
    title: "Recent activity",
    description: "Recent payment and overdue events.",
    zone: "secondary",
    size: "medium",
    priority: 10,
    requiredData: ["activity"],
    component: EmptyRegisteredModule
  },
  {
    id: "secondary-bills",
    title: "Recent bills",
    description: "Compact bill preview with route to full bill management.",
    zone: "secondary",
    size: "medium",
    priority: 20,
    requiredData: ["bills"],
    component: EmptyRegisteredModule
  }
];

export function getDashboardModulesByZone(zone: DashboardZone): DashboardModuleDefinition[] {
  return dashboardModuleRegistry
    .filter((module) => module.zone === zone)
    .sort((a, b) => a.priority - b.priority);
}
```

- [ ] **Step 5: Run the registry test**

Run:

```bash
pnpm vitest run tests/unit/dashboard-modules.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/components/dashboard/modules/types.ts src/components/dashboard/modules/registry.ts tests/unit/dashboard-modules.test.ts
git commit -m "feat: add dashboard module registry"
```

---

## Task 2: Extend Dashboard Aggregate Data For Workflow Modules

**Files:**

- Modify: `src/lib/dashboard/aggregate.ts`
- Modify: `tests/unit/dashboard-aggregate.test.ts`

- [ ] **Step 1: Add failing aggregate tests**

Add these tests inside the existing `describe("buildDashboardPayload", () => { })` block in `tests/unit/dashboard-aggregate.test.ts`:

```ts
  it("builds due queue with overdue, due today, and upcoming unpaid occurrences", () => {
    const payload = buildDashboardPayload({
      today: "2026-06-08",
      dashboardCurrency: "USD",
      rates,
      bills: [
        { id: "bill-1", name: "Overdue Bill", category: "Ops", priority: "critical", tags: ["risk"] },
        { id: "bill-2", name: "Due Today", category: "SaaS", priority: "high", tags: ["today"] },
        { id: "bill-3", name: "Upcoming", category: "Tools", priority: "medium", tags: ["tools"] },
        { id: "bill-4", name: "Paid", category: "Tools", priority: "low", tags: [] }
      ],
      occurrences: [
        { id: "occ-1", billId: "bill-1", dueDate: "2026-06-05", amountCents: 10000, currency: "USD", status: "overdue" },
        { id: "occ-2", billId: "bill-2", dueDate: "2026-06-08", amountCents: 20000, currency: "USD", status: "unpaid" },
        { id: "occ-3", billId: "bill-3", dueDate: "2026-06-12", amountCents: 30000, currency: "USD", status: "unpaid" },
        { id: "occ-4", billId: "bill-4", dueDate: "2026-06-09", amountCents: 40000, currency: "USD", status: "paid" }
      ]
    });

    expect(payload.dueQueue.map((item) => item.name)).toEqual([
      "Overdue Bill",
      "Due Today",
      "Upcoming"
    ]);
    expect(payload.dueQueue[0]).toMatchObject({
      id: "occ-1",
      billId: "bill-1",
      category: "Ops",
      priority: "critical",
      tags: ["risk"],
      status: "overdue",
      daysUntilDue: 3
    });
    expect(payload.dueQueue[1]?.daysUntilDue).toBe(0);
    expect(payload.dueQueue[2]?.daysUntilDue).toBe(4);
  });

  it("limits due queue to the most urgent eight items", () => {
    const occurrences = Array.from({ length: 10 }, (_, index) => ({
      id: `occ-${index}`,
      billId: `bill-${index}`,
      dueDate: `2026-06-${String(9 + index).padStart(2, "0")}`,
      amountCents: 1000,
      currency: "USD" as const,
      status: "unpaid" as const
    }));

    const payload = buildDashboardPayload({
      today: "2026-06-08",
      dashboardCurrency: "USD",
      rates,
      bills: occurrences.map((occurrence, index) => ({
        id: occurrence.billId,
        name: `Bill ${index}`,
        category: "Other",
        priority: "medium",
        tags: []
      })),
      occurrences
    });

    expect(payload.dueQueue).toHaveLength(8);
    expect(payload.dueQueue[0]?.name).toBe("Bill 0");
    expect(payload.dueQueue[7]?.name).toBe("Bill 7");
  });

  it("calculates paid month-to-date amount and count", () => {
    const payload = buildDashboardPayload({
      today: "2026-06-20",
      dashboardCurrency: "USD",
      rates,
      bills: [{ id: "bill-1", name: "Paid Bill", category: "Other", priority: "low", tags: [] }],
      occurrences: [
        { id: "occ-1", billId: "bill-1", dueDate: "2026-06-03", amountCents: 10000, currency: "USD", status: "paid" },
        { id: "occ-2", billId: "bill-1", dueDate: "2026-06-18", amountCents: 15000, currency: "USD", status: "paid" },
        { id: "occ-3", billId: "bill-1", dueDate: "2026-05-28", amountCents: 40000, currency: "USD", status: "paid" }
      ]
    });

    expect(payload.summary.paidMonthToDateCount).toBe(2);
    expect(payload.summary.paidMonthToDateAmountCents).toBe(25000);
  });
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
pnpm vitest run tests/unit/dashboard-aggregate.test.ts
```

Expected: fail because `payload.dueQueue`, `summary.paidMonthToDateCount`, and `summary.paidMonthToDateAmountCents` do not exist.

- [ ] **Step 3: Extend aggregate types and implementation**

Modify `src/lib/dashboard/aggregate.ts`.

Add `BillPriority` to the type import:

```ts
import type { BillPriority, CurrencyCode, OccurrenceStatus } from "@/lib/billing/types";
```

Update `DashboardBillMeta`:

```ts
export type DashboardBillMeta = {
  id: string;
  name: string;
  category: string;
  priority: BillPriority | string;
  tags: string[];
  cycle?: string;
};
```

Update `DashboardPayload`:

```ts
export type DashboardPayload = {
  summary: {
    monthlyObligationsCents: number;
    yearlyProjectionCents: number;
    pendingCount: number;
    pendingAmountCents: number;
    overdueCount: number;
    overdueAmountCents: number;
    paidMonthToDateCount: number;
    paidMonthToDateAmountCents: number;
  };
  categoryTotals: Array<{ category: string; amountCents: number }>;
  monthlyBreakdown: Array<{ month: string; amountCents: number }>;
  upcoming30Days: Array<{
    id: string;
    billId: string;
    name: string;
    dueDate: string;
    amountCents: number;
    currency: CurrencyCode;
    status: OccurrenceStatus;
    daysUntilDue: number;
  }>;
  dueQueue: Array<{
    id: string;
    billId: string;
    name: string;
    category: string;
    priority: BillPriority;
    tags: string[];
    dueDate: string;
    amountCents: number;
    currency: CurrencyCode;
    status: OccurrenceStatus;
    daysUntilDue: number;
  }>;
};
```

Add helper constants below `convertOccurrenceAmount`:

```ts
const DUE_QUEUE_LIMIT = 8;

const priorityRank: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

function normalizePriority(priority: string | undefined): BillPriority {
  if (priority === "critical" || priority === "high" || priority === "medium" || priority === "low") {
    return priority;
  }
  return "medium";
}
```

Inside `buildDashboardPayload`, initialize these values near the existing counters:

```ts
  let paidMonthToDateCount = 0;
  let paidMonthToDateAmountCents = 0;
```

Initialize the due queue near `upcomingList`:

```ts
  const dueQueue: DashboardPayload["dueQueue"] = [];
```

Inside the loop, after `const monthKey = dueDate.toISOString().slice(0, 7);`, add:

```ts
    const rawDaysUntilDue = differenceInDays(dueDate, todayDate);
    const daysUntilDue = occurrence.status === "overdue"
      ? Math.abs(rawDaysUntilDue)
      : rawDaysUntilDue;
```

Inside the `if (occurrence.status === "paid")` block, add:

```ts
      if (monthKey === currentMonthKey) {
        paidMonthToDateCount++;
        paidMonthToDateAmountCents += converted;
      }
```

After the existing upcoming-list block, add:

```ts
    if (
      occurrence.status === "overdue" ||
      (occurrence.status === "unpaid" && rawDaysUntilDue >= 0 && rawDaysUntilDue <= 30)
    ) {
      dueQueue.push({
        id: occurrence.id,
        billId: occurrence.billId,
        name: bill?.name ?? "Unknown",
        category: bill?.category ?? "Other",
        priority: normalizePriority(bill?.priority),
        tags: bill?.tags ?? [],
        dueDate: occurrence.dueDate,
        amountCents: converted,
        currency: input.dashboardCurrency,
        status: occurrence.status,
        daysUntilDue
      });
    }
```

Before the return, add:

```ts
  dueQueue.sort((a, b) => {
    if (a.status === "overdue" && b.status !== "overdue") return -1;
    if (a.status !== "overdue" && b.status === "overdue") return 1;
    const dueDiff = a.daysUntilDue - b.daysUntilDue;
    if (dueDiff !== 0) return dueDiff;
    return (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
  });
```

Update the returned `summary`:

```ts
    summary: {
      monthlyObligationsCents,
      yearlyProjectionCents,
      pendingCount,
      pendingAmountCents,
      overdueCount,
      overdueAmountCents,
      paidMonthToDateCount,
      paidMonthToDateAmountCents
    },
```

Add `dueQueue` to the returned payload:

```ts
    dueQueue: dueQueue.slice(0, DUE_QUEUE_LIMIT)
```

- [ ] **Step 4: Run aggregate tests**

Run:

```bash
pnpm vitest run tests/unit/dashboard-aggregate.test.ts
```

Expected: pass.

- [ ] **Step 5: Run full unit tests**

Run:

```bash
pnpm run test
```

Expected: pass.

- [ ] **Step 6: Commit**

Run:

```bash
git add src/lib/dashboard/aggregate.ts tests/unit/dashboard-aggregate.test.ts
git commit -m "feat: add workflow dashboard aggregate data"
```

---

## Task 3: Build Shared Module Card And KPI Module

**Files:**

- Create: `src/components/dashboard/modules/module-card.tsx`
- Create: `src/components/dashboard/modules/kpi-summary-module.tsx`
- Modify: `src/components/dashboard/modules/registry.ts`
- Test: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Add failing E2E expectations for operational KPIs**

Modify the "summary KPI cards render with shadcn Card" test in `tests/e2e/dashboard.spec.ts` to:

```ts
  test("operational KPI modules render with command-center labels", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Due this week")).toBeVisible();
    await expect(page.getByText("Overdue")).toBeVisible();
    await expect(page.getByText("Paid MTD")).toBeVisible();
    await expect(page.getByText("Yearly Projection")).toBeVisible();
    const cards = page.locator("[data-slot=card]");
    expect(await cards.count()).toBeGreaterThan(0);
  });
```

- [ ] **Step 2: Run the failing E2E test**

Run:

```bash
pnpm playwright test tests/e2e/dashboard.spec.ts -g "operational KPI modules"
```

Expected: fail because "Due this week" and "Paid MTD" are not rendered.

- [ ] **Step 3: Create shared module card**

Create `src/components/dashboard/modules/module-card.tsx`:

```tsx
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ModuleCardProps = {
  title?: string;
  action?: ReactNode;
  className?: string;
  contentClassName?: string;
  children: ReactNode;
};

export function ModuleCard({
  title,
  action,
  className,
  contentClassName,
  children
}: ModuleCardProps) {
  return (
    <Card className={cn("border-border bg-white shadow-xs dark:bg-card", className)}>
      {(title || action) && (
        <CardHeader className="flex-row items-center justify-between gap-3">
          {title ? <CardTitle className="text-sm font-semibold">{title}</CardTitle> : <div />}
          {action}
        </CardHeader>
      )}
      <CardContent className={cn(contentClassName)}>
        {children}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Create KPI module**

Create `src/components/dashboard/modules/kpi-summary-module.tsx`:

```tsx
import { AlertTriangle, CalendarClock, CheckCircle2, TrendingUp } from "lucide-react";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";
import { cn } from "@/lib/utils";

function formatCents(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })}`;
}

type KpiTone = "primary" | "danger" | "success" | "neutral";

const toneClasses: Record<KpiTone, string> = {
  primary: "bg-primary/10 text-primary",
  danger: "bg-destructive/10 text-destructive",
  success: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  neutral: "bg-muted text-muted-foreground"
};

type KpiItem = {
  label: string;
  value: string;
  helper: string;
  tone: KpiTone;
  icon: typeof CalendarClock;
};

export function KpiSummaryModule({ context }: DashboardModuleProps) {
  const { summary } = context.payload;

  const items: KpiItem[] = [
    {
      label: "Due this week",
      value: formatCents(summary.monthlyObligationsCents),
      helper: `${summary.pendingCount} unpaid items tracked`,
      tone: "primary",
      icon: CalendarClock
    },
    {
      label: "Overdue",
      value: String(summary.overdueCount),
      helper: `${formatCents(summary.overdueAmountCents)} needs attention`,
      tone: "danger",
      icon: AlertTriangle
    },
    {
      label: "Paid MTD",
      value: formatCents(summary.paidMonthToDateAmountCents),
      helper: `${summary.paidMonthToDateCount} payments recorded`,
      tone: "success",
      icon: CheckCircle2
    },
    {
      label: "Yearly Projection",
      value: formatCents(summary.yearlyProjectionCents),
      helper: "Annual commitment",
      tone: "neutral",
      icon: TrendingUp
    }
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <ModuleCard key={item.label} className="min-h-[126px]" contentClassName="flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", toneClasses[item.tone])}>
                <Icon size={16} />
              </span>
            </div>
            <div className="mt-5">
              <p className="text-2xl font-bold tracking-tight">{item.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{item.helper}</p>
            </div>
          </ModuleCard>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Wire the KPI module into the registry**

Modify `src/components/dashboard/modules/registry.ts`.

Add import:

```ts
import { KpiSummaryModule } from "@/components/dashboard/modules/kpi-summary-module";
```

Change the `kpi-summary` definition component from `EmptyRegisteredModule` to:

```ts
    component: KpiSummaryModule
```

- [ ] **Step 6: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/dashboard/modules/module-card.tsx src/components/dashboard/modules/kpi-summary-module.tsx src/components/dashboard/modules/registry.ts tests/e2e/dashboard.spec.ts
git commit -m "feat: add modular dashboard KPI summary"
```

---

## Task 4: Build Due Queue And Action Panel Modules

**Files:**

- Create: `src/components/dashboard/modules/due-queue-module.tsx`
- Create: `src/components/dashboard/modules/action-panel-module.tsx`
- Modify: `src/components/dashboard/modules/registry.ts`
- Test: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Add failing E2E expectations for due queue and action rail**

Replace the existing "upcoming list renders with status badges" test in `tests/e2e/dashboard.spec.ts` with:

```ts
  test("due queue and action rail render workflow modules", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Due Queue" })).toBeVisible();
    await expect(page.getByText("Open bill")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Action Panel" })).toBeVisible();
    await expect(page.getByText("Review overdue bills")).toBeVisible();
  });
```

- [ ] **Step 2: Run the failing E2E test**

Run:

```bash
pnpm playwright test tests/e2e/dashboard.spec.ts -g "due queue and action rail"
```

Expected: fail because the modules are not rendered yet.

- [ ] **Step 3: Create Due Queue module**

Create `src/components/dashboard/modules/due-queue-module.tsx`:

```tsx
import Link from "next/link";
import { AlertTriangle, CalendarClock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import type { DashboardDueQueueItem, DashboardModuleProps } from "@/components/dashboard/modules/types";
import { cn } from "@/lib/utils";

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

function formatDueLabel(item: DashboardDueQueueItem): string {
  if (item.status === "overdue") {
    return item.daysUntilDue === 1 ? "1 day overdue" : `${item.daysUntilDue} days overdue`;
  }
  if (item.daysUntilDue === 0) return "Due today";
  if (item.daysUntilDue === 1) return "Due tomorrow";
  return `Due in ${item.daysUntilDue} days`;
}

function statusTone(item: DashboardDueQueueItem): string {
  if (item.status === "overdue") return "border-destructive/30 bg-destructive/[0.04]";
  if (item.daysUntilDue <= 3) return "border-amber-200 bg-amber-50/60 dark:bg-amber-950/20";
  return "border-border bg-white dark:bg-card";
}

export function DueQueueModule({ context }: DashboardModuleProps) {
  const items = context.dueQueueItems;

  return (
    <ModuleCard
      title="Due Queue"
      action={
        <Link href="/bills" className="text-xs font-medium text-primary hover:text-primary/80">
          View all
        </Link>
      }
      contentClassName="space-y-2"
    >
      {items.length === 0 ? (
        <div className="flex min-h-[220px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background/60 p-8 text-center">
          <CalendarClock size={28} className="text-muted-foreground" />
          <p className="mt-3 text-sm font-medium">No bills need attention</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Upcoming and overdue bills will appear here when they are ready for review.
          </p>
        </div>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className={cn(
              "grid gap-3 rounded-lg border p-3 transition hover:border-primary/30 sm:grid-cols-[minmax(0,1fr)_120px_120px_96px] sm:items-center",
              statusTone(item)
            )}
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {item.status === "overdue" && <AlertTriangle size={14} className="shrink-0 text-destructive" />}
                <p className="truncate text-sm font-semibold">{item.name}</p>
              </div>
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {item.vendor ? `${item.vendor} · ` : ""}
                {item.category}
                {item.tags.length > 0 ? ` · ${item.tags.slice(0, 2).join(", ")}` : ""}
              </p>
            </div>
            <div className="text-sm font-semibold sm:text-right">
              {formatCurrency(item.amountCents, item.currency)}
            </div>
            <div className={cn("text-xs font-medium", item.status === "overdue" ? "text-destructive" : "text-muted-foreground")}>
              {formatDueLabel(item)}
            </div>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <Badge variant={item.status === "overdue" ? "destructive" : "warning"} className="capitalize">
                {item.status}
              </Badge>
              <Link href={`/bills/${item.billId}`}>
                <Button variant="outline" size="sm">
                  <ExternalLink size={14} />
                  Open bill
                </Button>
              </Link>
            </div>
          </div>
        ))
      )}
    </ModuleCard>
  );
}
```

- [ ] **Step 4: Create Action Panel module**

Create `src/components/dashboard/modules/action-panel-module.tsx`:

```tsx
import Link from "next/link";
import { AlertTriangle, Bell, FileUp, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";

type ActionItem = {
  title: string;
  description: string;
  href: string;
  icon: typeof AlertTriangle;
  tone: "danger" | "neutral";
};

export function ActionPanelModule({ context }: DashboardModuleProps) {
  const overdueCount = context.payload.summary.overdueCount;
  const pendingCount = context.payload.summary.pendingCount;
  const hasActivity = context.activityItems.length > 0;

  const actions: ActionItem[] = [
    {
      title: "Review overdue bills",
      description: overdueCount > 0
        ? `${overdueCount} bills need immediate attention.`
        : "No overdue bills right now.",
      href: "/bills",
      icon: AlertTriangle,
      tone: overdueCount > 0 ? "danger" : "neutral"
    },
    {
      title: "Prepare payment run",
      description: `${pendingCount} unpaid bills are being tracked.`,
      href: "/payments",
      icon: RefreshCw,
      tone: "neutral"
    },
    {
      title: "Check reminders",
      description: "Confirm upcoming bills have reminder coverage.",
      href: "/settings",
      icon: Bell,
      tone: "neutral"
    },
    {
      title: "Import bills",
      description: "Bring spreadsheet data into BillFlow.",
      href: "/import-export",
      icon: FileUp,
      tone: "neutral"
    }
  ];

  return (
    <ModuleCard title="Action Panel" contentClassName="space-y-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.title}
            href={action.href}
            className="block rounded-lg border border-border bg-background/60 p-3 transition hover:border-primary/30 hover:bg-muted/50"
          >
            <div className="flex items-start gap-3">
              <span className={action.tone === "danger" ? "text-destructive" : "text-primary"}>
                <Icon size={16} />
              </span>
              <div>
                <p className="text-sm font-semibold">{action.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Link>
        );
      })}
      {!hasActivity && (
        <div className="rounded-lg border border-dashed border-border p-3 text-xs text-muted-foreground">
          Activity will appear after bills are paid, imported, or become overdue.
        </div>
      )}
      <Link href="/bills">
        <Button variant="outline" className="w-full">
          Open bill management
        </Button>
      </Link>
    </ModuleCard>
  );
}
```

- [ ] **Step 5: Wire modules into registry**

Modify `src/components/dashboard/modules/registry.ts`.

Add imports:

```ts
import { ActionPanelModule } from "@/components/dashboard/modules/action-panel-module";
import { DueQueueModule } from "@/components/dashboard/modules/due-queue-module";
```

Change these registry entries:

```ts
    component: DueQueueModule
```

for `due-queue`, and:

```ts
    component: ActionPanelModule
```

for `action-panel`.

- [ ] **Step 6: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: pass.

- [ ] **Step 7: Commit**

Run:

```bash
git add src/components/dashboard/modules/due-queue-module.tsx src/components/dashboard/modules/action-panel-module.tsx src/components/dashboard/modules/registry.ts tests/e2e/dashboard.spec.ts
git commit -m "feat: add dashboard due queue and action panel"
```

---

## Task 5: Build Supporting Analytics And Secondary Modules

**Files:**

- Create: `src/components/dashboard/modules/supporting-analytics-module.tsx`
- Create: `src/components/dashboard/modules/recent-activity-module.tsx`
- Create: `src/components/dashboard/modules/secondary-bills-module.tsx`
- Modify: `src/components/dashboard/modules/registry.ts`
- Test: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Update E2E expectations for analytics and secondary modules**

Modify the "charts render card titles" test in `tests/e2e/dashboard.spec.ts`:

```ts
  test("supporting analytics render below the main workflow", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Spending by Category")).toBeVisible();
    await expect(page.getByText("Monthly Cost Breakdown")).toBeVisible();
    await expect(page.getByText("Recent Activity")).toBeVisible();
    await expect(page.getByText("Recent Bills")).toBeVisible();
  });
```

Replace the "bill list with filters and shadcn Select components renders" test with:

```ts
  test("dashboard links to full bill management instead of rendering the full all-bills grid", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Recent Bills" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manage all bills" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All Bills" })).not.toBeVisible();
  });
```

- [ ] **Step 2: Run failing E2E tests**

Run:

```bash
pnpm playwright test tests/e2e/dashboard.spec.ts -g "supporting analytics|dashboard links"
```

Expected: fail until modules are rendered and the dashboard no longer uses the full all-bills grid.

- [ ] **Step 3: Create supporting analytics module**

Create `src/components/dashboard/modules/supporting-analytics-module.tsx`:

```tsx
import { CategoryChart } from "@/components/dashboard/category-chart";
import { MonthlyBreakdown } from "@/components/dashboard/monthly-breakdown";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";

export function SupportingAnalyticsModule({ context }: DashboardModuleProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <CategoryChart categoryTotals={context.payload.categoryTotals} />
      <MonthlyBreakdown monthlyBreakdown={context.payload.monthlyBreakdown} />
    </div>
  );
}
```

- [ ] **Step 4: Create recent activity module**

Create `src/components/dashboard/modules/recent-activity-module.tsx`:

```tsx
import { AlertTriangle, Check, Plus, Upload } from "lucide-react";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import type { DashboardActivityItem, DashboardModuleProps } from "@/components/dashboard/modules/types";

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const activityIcons: Record<string, React.ReactNode> = {
  paid: <Check size={14} />,
  added: <Plus size={14} />,
  imported: <Upload size={14} />,
  overdue: <AlertTriangle size={14} />
};

const activityColors: Record<string, string> = {
  paid: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  added: "bg-primary/10 text-primary",
  imported: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive"
};

function ActivityRow({ item }: { item: DashboardActivityItem }) {
  return (
    <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted/50">
      <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activityColors[item.action] ?? "bg-muted text-muted-foreground"}`}>
        {activityIcons[item.action] ?? <Check size={14} />}
      </div>
      <div className="min-w-0 flex-1">
        <span className="font-medium">{item.billName}</span>
        <span className="text-muted-foreground">
          {" "}
          was {item.action}
          {item.amountCents > 0 && ` - ${formatCurrency(item.amountCents)}`}
        </span>
      </div>
      <span className="shrink-0 text-xs text-muted-foreground">{item.date}</span>
    </div>
  );
}

export function RecentActivityModule({ context }: DashboardModuleProps) {
  return (
    <ModuleCard title="Recent Activity" contentClassName="space-y-1">
      {context.activityItems.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">No recent activity</p>
      ) : (
        context.activityItems.map((item) => <ActivityRow key={item.id} item={item} />)
      )}
    </ModuleCard>
  );
}
```

- [ ] **Step 5: Create secondary bills module**

Create `src/components/dashboard/modules/secondary-bills-module.tsx`:

```tsx
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModuleCard } from "@/components/dashboard/modules/module-card";
import type { DashboardModuleProps } from "@/components/dashboard/modules/types";

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0
  }).format(cents / 100);
}

export function SecondaryBillsModule({ context }: DashboardModuleProps) {
  const bills = context.bills.slice(0, 4);

  return (
    <ModuleCard
      title="Recent Bills"
      action={
        <Link href="/bills">
          <Button variant="ghost" size="sm">
            Manage all bills
            <ArrowRight size={14} />
          </Button>
        </Link>
      }
      contentClassName="space-y-2"
    >
      {bills.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm font-medium">No bills yet</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Add your first bill to build your dashboard.
          </p>
        </div>
      ) : (
        bills.map((bill) => (
          <Link
            key={bill.id}
            href={`/bills/${bill.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/60 p-3 transition hover:border-primary/30 hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{bill.name}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {bill.category} · {bill.dueDate}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold">{formatCurrency(bill.amountCents, bill.currency)}</p>
              <Badge variant={bill.status === "overdue" ? "destructive" : bill.status === "paid" ? "success" : "warning"} className="mt-1 capitalize">
                {bill.status}
              </Badge>
            </div>
          </Link>
        ))
      )}
    </ModuleCard>
  );
}
```

- [ ] **Step 6: Wire modules into registry**

Modify `src/components/dashboard/modules/registry.ts`.

Add imports:

```ts
import { RecentActivityModule } from "@/components/dashboard/modules/recent-activity-module";
import { SecondaryBillsModule } from "@/components/dashboard/modules/secondary-bills-module";
import { SupportingAnalyticsModule } from "@/components/dashboard/modules/supporting-analytics-module";
```

Change registry components:

```ts
    component: SupportingAnalyticsModule
```

for `supporting-analytics`,

```ts
    component: RecentActivityModule
```

for `recent-activity`, and:

```ts
    component: SecondaryBillsModule
```

for `secondary-bills`.

- [ ] **Step 7: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: pass.

- [ ] **Step 8: Commit**

Run:

```bash
git add src/components/dashboard/modules/supporting-analytics-module.tsx src/components/dashboard/modules/recent-activity-module.tsx src/components/dashboard/modules/secondary-bills-module.tsx src/components/dashboard/modules/registry.ts tests/e2e/dashboard.spec.ts
git commit -m "feat: add dashboard analytics and secondary modules"
```

---

## Task 6: Replace DashboardContent With Modular Layout

**Files:**

- Create: `src/components/dashboard/modules/dashboard-module-layout.tsx`
- Modify: `src/app/(app)/dashboard/dashboard-content.tsx`
- Test: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Add E2E test for modular dashboard layout**

Add this test to `tests/e2e/dashboard.spec.ts`:

```ts
  test("modular command center prioritizes due queue before analytics", async ({ page }) => {
    await page.goto("/dashboard");

    const dueQueue = page.getByRole("heading", { name: "Due Queue" });
    const analytics = page.getByText("Spending by Category");

    await expect(dueQueue).toBeVisible();
    await expect(analytics).toBeVisible();

    const dueBox = await dueQueue.boundingBox();
    const analyticsBox = await analytics.boundingBox();

    expect(dueBox).not.toBeNull();
    expect(analyticsBox).not.toBeNull();
    expect(dueBox!.y).toBeLessThan(analyticsBox!.y);
  });
```

- [ ] **Step 2: Run the failing E2E test**

Run:

```bash
pnpm playwright test tests/e2e/dashboard.spec.ts -g "modular command center"
```

Expected: fail because the layout does not render through modular zones yet.

- [ ] **Step 3: Create dashboard module layout**

Create `src/components/dashboard/modules/dashboard-module-layout.tsx`:

```tsx
import type { DashboardModuleContext, DashboardModuleDefinition, DashboardZone } from "@/components/dashboard/modules/types";
import { getDashboardModulesByZone } from "@/components/dashboard/modules/registry";

type DashboardModuleLayoutProps = {
  context: DashboardModuleContext;
};

function renderZone(zone: DashboardZone, context: DashboardModuleContext) {
  const modules = getDashboardModulesByZone(zone);

  return modules.map((module: DashboardModuleDefinition) => {
    const Component = module.component;
    return <Component key={module.id} context={context} />;
  });
}

export function DashboardModuleLayout({ context }: DashboardModuleLayoutProps) {
  return (
    <div className="space-y-6">
      <section aria-label="Dashboard summary">
        {renderZone("kpi", context)}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]" aria-label="Dashboard workflow">
        <div className="min-w-0 space-y-6">
          {renderZone("main", context)}
        </div>
        <aside className="min-w-0 space-y-6" aria-label="Dashboard actions">
          {renderZone("rail", context)}
        </aside>
      </section>

      <section aria-label="Dashboard analytics">
        {renderZone("analytics", context)}
      </section>

      <section className="grid gap-6 xl:grid-cols-2" aria-label="Dashboard secondary modules">
        {renderZone("secondary", context)}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Refactor DashboardContent imports**

Modify `src/app/(app)/dashboard/dashboard-content.tsx`.

Remove these imports:

```ts
import { Plus, Upload, Globe, Calculator, Check, AlertTriangle } from "lucide-react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { MonthlyBreakdown } from "@/components/dashboard/monthly-breakdown";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { BillList, type BillListItem } from "@/components/bills/bill-list";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
```

Add these imports:

```ts
import { AlertTriangle } from "lucide-react";
import { DashboardModuleLayout } from "@/components/dashboard/modules/dashboard-module-layout";
import type {
  DashboardActivityItem,
  DashboardDueQueueItem,
  DashboardModuleContext
} from "@/components/dashboard/modules/types";
import type { BillListItem } from "@/components/bills/bill-list";
```

Keep:

```ts
import { DashboardCurrencySelector } from "@/components/currency/dashboard-currency-selector";
import { CreateBillDialog } from "@/components/bills/create-bill-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
```

- [ ] **Step 5: Remove period and filter state from DashboardContent**

Remove:

```ts
function filterBillsByPeriod(bills: BillListItem[], period: string): BillListItem[] {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = `${now.getFullYear()}`;
  switch (period) {
    case "month":
      return bills.filter((bill) => bill.dueDate.startsWith(currentMonth));
    case "year":
      return bills.filter((bill) => bill.dueDate.startsWith(currentYear));
    default:
      return bills;
  }
}
```

Remove:

```ts
type FilterState = {
  search: string;
  status: OccurrenceStatus | null;
  category: string | null;
  tag: string | null;
  priority: BillPriority | null;
};
```

Remove `formatCurrency`, `activityIcons`, `activityColors`, `period`, `filters`, `searchLoading`, `debounceRef`, the `useEffect` that debounces `filters.search`, and the memoized `categories`, `tags`, `nonSearchFiltered`, and `periodFiltered` values.

- [ ] **Step 6: Add due queue item derivation**

In `src/app/(app)/dashboard/dashboard-content.tsx`, add this helper below `deriveActivity`:

```ts
function deriveDueQueueItems(
  payloadDueQueue: NonNullable<ReturnType<typeof buildDashboardPayload>>["dueQueue"],
  bills: DashboardBillData[]
): DashboardDueQueueItem[] {
  const billMap = new Map(bills.map((bill) => [bill.id, bill]));

  return payloadDueQueue.map((item) => {
    const bill = billMap.get(item.billId);
    return {
      ...item,
      vendor: bill?.vendor ?? "",
      priority: item.priority as BillPriority
    };
  });
}
```

- [ ] **Step 7: Build module context**

Inside `DashboardContent`, after `activityItems`, add:

```ts
  const dueQueueItems = useMemo(() => {
    if (!rawData || !dashboardPayload) return [];
    return deriveDueQueueItems(dashboardPayload.dueQueue, rawData.bills);
  }, [rawData, dashboardPayload]);

  const moduleContext: DashboardModuleContext | null = useMemo(() => {
    if (!dashboardPayload) return null;
    return {
      payload: dashboardPayload,
      bills: billListItems,
      activityItems: activityItems as DashboardActivityItem[],
      dueQueueItems,
      currency: currency as CurrencyCode,
      onRefresh: fetchData
    };
  }, [dashboardPayload, billListItems, activityItems, dueQueueItems, currency, fetchData]);
```

- [ ] **Step 8: Replace returned dashboard body with modular layout**

In the final `return`, keep the header and Add Bill/currency controls, then replace the tabs, summary cards, charts, quick actions, AI insight card, recent activity, filters, and bill grid with:

```tsx
      {dashboardPayload?.summary.overdueCount ? (
        <div className="mb-6 rounded-xl border border-destructive/30 bg-destructive/[0.04] p-4 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">
                {dashboardPayload.summary.overdueCount} overdue bills need attention
              </p>
              <p className="mt-1 text-xs">
                Open the due queue to review overdue bills and record payments.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {moduleContext && <DashboardModuleLayout context={moduleContext} />}
```

- [ ] **Step 9: Run typecheck**

Run:

```bash
pnpm run typecheck
```

Expected: pass. If TypeScript reports unused imports in `dashboard-content.tsx`, remove those exact unused imports and rerun.

- [ ] **Step 10: Run dashboard E2E tests**

Run:

```bash
pnpm playwright test tests/e2e/dashboard.spec.ts
```

Expected: pass after updating stale tests in Task 7.

- [ ] **Step 11: Commit**

Run:

```bash
git add src/components/dashboard/modules/dashboard-module-layout.tsx 'src/app/(app)/dashboard/dashboard-content.tsx' tests/e2e/dashboard.spec.ts
git commit -m "feat: render dashboard through modular layout"
```

---

## Task 7: Final E2E, Responsive, And Copy Cleanup

**Files:**

- Modify: `tests/e2e/dashboard.spec.ts`
- Modify if needed: files changed in Tasks 3-6

- [ ] **Step 1: Replace stale dashboard E2E test file with modular expectations**

Make `tests/e2e/dashboard.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test.describe("Dashboard - modular command center", () => {
  test("renders header and modular dashboard cards", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Dashboard|Welcome back/ })).toBeVisible();
    await expect(page.getByText("Due this week")).toBeVisible();
    await expect(page.locator("[data-slot=card]").first()).toBeVisible();
  });

  test("operational KPI modules render with command-center labels", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Due this week")).toBeVisible();
    await expect(page.getByText("Overdue")).toBeVisible();
    await expect(page.getByText("Paid MTD")).toBeVisible();
    await expect(page.getByText("Yearly Projection")).toBeVisible();
  });

  test("due queue and action rail render workflow modules", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Due Queue" })).toBeVisible();
    await expect(page.getByText("Open bill")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Action Panel" })).toBeVisible();
    await expect(page.getByText("Review overdue bills")).toBeVisible();
  });

  test("supporting analytics render below the main workflow", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Spending by Category")).toBeVisible();
    await expect(page.getByText("Monthly Cost Breakdown")).toBeVisible();
    await expect(page.getByText("Recent Activity")).toBeVisible();
    await expect(page.getByText("Recent Bills")).toBeVisible();
  });

  test("dashboard links to full bill management instead of rendering the full all-bills grid", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Recent Bills" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Manage all bills" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "All Bills" })).not.toBeVisible();
  });

  test("modular command center prioritizes due queue before analytics", async ({ page }) => {
    await page.goto("/dashboard");

    const dueQueue = page.getByRole("heading", { name: "Due Queue" });
    const analytics = page.getByText("Spending by Category");

    await expect(dueQueue).toBeVisible();
    await expect(analytics).toBeVisible();

    const dueBox = await dueQueue.boundingBox();
    const analyticsBox = await analytics.boundingBox();

    expect(dueBox).not.toBeNull();
    expect(analyticsBox).not.toBeNull();
    expect(dueBox!.y).toBeLessThan(analyticsBox!.y);
  });

  test("dashboard is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await expect(page.getByText("Due this week")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Due Queue" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Action Panel" })).toBeVisible();
  });

  test("shadcn Button components render", async ({ page }) => {
    await page.goto("/pricing");
    const buttons = page.getByRole("button");
    await expect(buttons.first()).toBeVisible();
  });

  test("shadcn Card renders on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Log in to BillFlow")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.locator("[data-slot=card]")).toBeVisible();
  });

  test("shadcn Card renders on signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.locator("[data-slot=card]")).toBeVisible();
    await expect(page.locator("[data-slot=card-footer]")).toBeVisible();
  });

  test("shadcn Badge renders on billing page", async ({ page }) => {
    await page.goto("/settings/billing");
    const badge = page.locator("[data-slot=badge]");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Free");
  });

  test("settings page renders with shadcn Select for currency", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.getByText("Default Currency")).toBeVisible();
  });

  test("onboarding page loads first step", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("What should we call you?")).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
  });
});
```

- [ ] **Step 2: Run lint and typecheck**

Run:

```bash
pnpm run lint && pnpm run typecheck
```

Expected: pass.

- [ ] **Step 3: Run unit tests**

Run:

```bash
pnpm run test
```

Expected: pass.

- [ ] **Step 4: Run dashboard E2E tests**

Run:

```bash
pnpm playwright test tests/e2e/dashboard.spec.ts
```

Expected: pass.

- [ ] **Step 5: Run production build**

Run:

```bash
pnpm run build
```

Expected: pass.

- [ ] **Step 6: Commit final cleanup**

If Step 1 changed the E2E file or Steps 2-5 required cleanup, run:

```bash
git add tests/e2e/dashboard.spec.ts src
git commit -m "test: update dashboard modular layout coverage"
```

If there are no changes, do not create an empty commit.

---

## Task 8: Browser Visual QA

**Files:**

- Modify if needed: dashboard module files from Tasks 3-6

- [ ] **Step 1: Start the local dev server**

Run:

```bash
pnpm dev
```

Expected: Next.js starts and prints a local URL, usually `http://localhost:3000`. Keep the process running until QA is finished.

- [ ] **Step 2: Open desktop dashboard**

Open `/dashboard` at a desktop viewport around `1440x1000`.

Expected:

- light gray canvas,
- compact left sidebar,
- purple Add Bill CTA,
- operational KPI row,
- due queue above charts,
- right action panel beside due queue,
- analytics below the workflow,
- no full `All Bills` grid on the dashboard.

- [ ] **Step 3: Check mobile dashboard**

Open `/dashboard` at `390x844`.

Expected:

- mobile header and sidebar drawer still work,
- KPI cards stack without clipped text,
- due queue rows fit without horizontal overflow,
- action panel stacks below due queue,
- charts remain readable or stack cleanly,
- primary content is not hidden behind the sidebar overlay.

- [ ] **Step 4: Fix visual issues**

If desktop or mobile has clipped text, horizontal overflow, weak hierarchy, or card spacing issues, adjust only the relevant module file:

- KPI issues: `src/components/dashboard/modules/kpi-summary-module.tsx`
- Due queue issues: `src/components/dashboard/modules/due-queue-module.tsx`
- Right rail issues: `src/components/dashboard/modules/action-panel-module.tsx`
- Zone spacing issues: `src/components/dashboard/modules/dashboard-module-layout.tsx`

After each fix, rerun:

```bash
pnpm run typecheck
pnpm playwright test tests/e2e/dashboard.spec.ts
```

Expected: both pass.

- [ ] **Step 5: Commit visual QA fixes**

If Step 4 changed files, run:

```bash
git add src/components/dashboard/modules tests/e2e/dashboard.spec.ts
git commit -m "fix: polish modular dashboard responsive layout"
```

If no files changed, do not create an empty commit.

---

## Verification Checklist

Run before final handoff:

```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm playwright test tests/e2e/dashboard.spec.ts
pnpm run build
git status --short
```

Expected:

- lint passes,
- typecheck passes,
- unit tests pass,
- dashboard E2E tests pass,
- production build passes,
- `git status --short` shows only intentional uncommitted changes or is clean.

## Self-Review Notes

Spec coverage:

- Visual direction is covered by module styling in Tasks 3-6 and browser QA in Task 8.
- Workflow-first hierarchy is covered by aggregate due queue data in Task 2 and layout priority in Task 6.
- Modular registry contract is covered by Task 1.
- Future Payment Calendar extensibility is covered by registry zones, sizes, and optional analytics slots in Tasks 1 and 6.
- Responsive behavior is covered by Task 7 and Task 8.

No drag-and-drop customization, new calendar feature, or new payment API work is included.
