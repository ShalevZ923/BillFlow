# BillFlow Modular Dashboard Redesign

Date: 2026-06-08

## Context

BillFlow already has a clean, professional dashboard direction: a light gray canvas, white cards, crisp borders, compact sidebar, clear status colors, and a purple primary action. The redesign should preserve that visual language while improving the dashboard's UX hierarchy and long-term extensibility.

The approved direction is a hybrid modular command center:

- Keep the current clean SaaS style.
- Make the dashboard workflow-led instead of widget-led.
- Build dashboard sections as reusable modules with explicit contracts.
- Use fixed polished dashboard zones now, with optional module slots for future growth.

## Goals

- Make the dashboard feel like a daily finance workspace.
- Put due, overdue, and payment-run work ahead of generic analytics.
- Keep BillFlow visually calm, credible, and professional.
- Make dashboard components modular enough to add features such as Payment Calendar, Cash Forecast, Import Queue, Reminder Health, or AI Risk Review without rewriting the page.
- Preserve a clear Bills page for complete bill management instead of forcing the dashboard to show every bill.

## Non-Goals

- User-customizable drag-and-drop dashboard layout in this phase.
- A dark premium finance console redesign.
- A marketing-site redesign.
- Replacing the app's existing component system or Tailwind/shadcn-style primitives.
- Building new payment, calendar, AI, or import features as part of this design spec.

## Visual Direction

Preserve the screenshot-inspired style:

- Light neutral app canvas.
- White cards with thin cool-gray borders.
- Compact left sidebar with restrained navigation.
- Purple primary action color for key CTAs.
- Soft semantic status treatments:
  - red for overdue and immediate risk,
  - amber for unpaid or pending,
  - green for paid or resolved,
  - blue/purple for neutral product emphasis.
- 8-10px radius cards and controls.
- Minimal shadows; borders and spacing should carry most of the structure.
- Dense but readable dashboard typography.

Avoid:

- Dark finance-console styling.
- Decorative gradients or oversized marketing-style dashboard cards.
- Nested cards.
- A dashboard filled with equal-weight widgets.
- Making charts the dominant first interaction.

## Dashboard UX Hierarchy

The dashboard should answer these questions in order:

1. What needs attention now?
2. What bills are due soon or overdue?
3. What is the next action?
4. What has changed recently?
5. What do the analytics say?

This means the due queue becomes the primary working surface. Charts and all-bills views support the workflow rather than leading it.

## Layout Zones

The dashboard should use fixed polished zones:

### Header Zone

Contains:

- Page title.
- Current date.
- Dashboard currency selector.
- Add Bill button.
- Optional command/search entry later.

### Alert Zone

Contains urgent system-level or bill-level alerts:

- Overdue bill summary.
- Reminder delivery failures.
- Import validation issues.
- Payment calendar conflicts later.

The alert should be compact, dismissible only when the underlying issue allows it, and link into the relevant module or filtered view.

### KPI Zone

Use three to four operational summary cards, not a generic metric wall.

Recommended cards:

- Due this week.
- Overdue.
- Paid month-to-date.
- Yearly projection or monthly obligations.

Each KPI card should support:

- value,
- short label,
- comparison or helper text,
- status tone,
- click target/filter action where useful.

### Main Workflow Zone

Primary module:

- `DueQueueModule`

This module lists due and overdue bill occurrences with enough information to act:

- bill name,
- vendor/category,
- amount and currency,
- due date or overdue duration,
- status/priority,
- primary action such as Open, Record Payment, or Review.

The due queue should be denser and more table/list-like than the current all-bills card grid.

### Right Rail Zone

Contains action-oriented modules:

- `ActionPanelModule`
- `ReminderHealthModule` later
- `ImportQueueModule` later
- `RecurringChangesModule` later
- `AiRiskReviewModule` later

The right rail should surface next steps, not repeat navigation.

### Supporting Analytics Zone

Contains analytical modules below or beside the workflow:

- `CategorySpendModule`
- `MonthlyBreakdownModule`
- `CashForecastModule` later
- `PaymentCalendarModule` later

Charts should be useful but secondary. They should not push the due queue below the fold on common desktop viewports.

### Secondary Bill Management Zone

The dashboard may show a small "recent bills" or "recently changed" module, but the complete all-bills card grid belongs on `/bills`.

## Module Contract

Every dashboard module should declare a small contract so future modules can be added predictably.

Required module metadata:

- `id`: stable module identifier.
- `title`: visible module title.
- `description`: internal or optional helper text.
- `zone`: intended dashboard zone.
- `size`: `small`, `medium`, `wide`, `rail`, or `full`.
- `priority`: ordering weight inside the zone.
- `requiredData`: named data dependencies.
- `featureFlag`: optional plan or release flag.
- `emptyState`: message and primary action when no data exists.
- `loadingState`: skeleton layout.
- `errorState`: recovery message and retry behavior.

Recommended rendering shape:

```ts
type DashboardModuleSize = "small" | "medium" | "wide" | "rail" | "full";
type DashboardZone = "kpi" | "main" | "rail" | "analytics" | "secondary";

type DashboardModuleDefinition = {
  id: string;
  title: string;
  zone: DashboardZone;
  size: DashboardModuleSize;
  priority: number;
  requiredData: string[];
  featureFlag?: string;
  component: React.ComponentType<DashboardModuleProps>;
};
```

The dashboard page should arrange registered modules. It should not own module business logic or internal layout details.

## Initial Module Inventory

### Core Modules

- `DashboardAlertModule`
- `KpiSummaryModule`
- `DueQueueModule`
- `ActionPanelModule`
- `CategorySpendModule`
- `MonthlyBreakdownModule`
- `RecentActivityModule`

### Growth Modules

- `PaymentCalendarModule`
- `CashForecastModule`
- `ImportQueueModule`
- `ReminderHealthModule`
- `RecurringChangesModule`
- `AiRiskReviewModule`
- `UpcomingBillsModule`

Growth modules should be added through the module registry and placed into existing zones or optional module slots.

## Payment Calendar Fit

`PaymentCalendarModule` should not require dashboard layout rewrites.

Recommended placement options:

- `analytics` zone as a wide module below the due queue.
- `main` zone as a temporary replacement for `DueQueueModule` when a calendar view is selected.
- `secondary` zone as a compact seven-day calendar strip.

The first version should be a wide analytics/supporting module, not a primary dashboard replacement.

## Interaction Rules

- Primary action remains Add Bill in the header.
- Due queue rows should support Open and Record Payment actions.
- KPI cards can filter the due queue or route to filtered Bills/Payments views.
- Modules should never hide critical alerts behind tabs.
- Optional modules can be feature-gated, but gated states should be honest and not over-promising.
- Empty accounts should show guided setup modules instead of blank analytics.

## Responsive Behavior

Desktop:

- Sidebar remains fixed width.
- Header, alert, KPI row, main workflow, right rail, and analytics zones are visible in that order.
- The due queue should remain above supporting charts.

Tablet:

- Right rail stacks below the due queue.
- KPI cards wrap to two columns.
- Analytics modules use a two-column or stacked layout depending on width.

Mobile:

- Sidebar becomes drawer navigation.
- Header actions collapse cleanly.
- KPI cards become horizontal-scroll or stacked cards.
- Due queue becomes a compact list.
- Right rail modules stack below due queue.
- Charts must preserve labels and not become unreadable.

## Implementation Notes

- Keep existing primitives where possible: `Card`, `Button`, `Badge`, inputs, tables, and lucide icons.
- Prefer list/table-like modules for operational workflows and cards for summary/secondary information.
- Module components should be small and independently testable.
- Shared formatting helpers should handle currency, due-date labels, status labels, and priority tone.
- Avoid putting all dashboard logic in `DashboardContent`.
- Dashboard data fetching should produce a module-friendly payload: summaries, due queue rows, activity, category totals, monthly totals, and optional module data.

## Testing And Verification

Redesign implementation should include:

- Unit tests for module data transformations.
- Component tests for empty/loading/error states where practical.
- E2E coverage for dashboard loading, filtering via KPI/due queue actions, Add Bill entry point, and Record Payment entry point if implemented.
- Visual QA at desktop, tablet, and mobile widths.
- Accessibility checks for keyboard navigation, focus states, semantic headings, and alert roles.

## Open Decisions

- Whether modules are registered in a static array or composed directly in a `DashboardLayout` component for the first iteration.
- Whether KPI cards should route to `/bills` or filter the in-dashboard due queue.
- Whether `PaymentCalendarModule` starts as a compact strip or a wide month/week module.

## Recommendation

Start with a fixed modular grid and module registry. This keeps the dashboard polished now while making future additions straightforward. Avoid drag-and-drop customization until real users prove they need it.
