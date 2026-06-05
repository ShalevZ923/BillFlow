# BillFlow External Readiness Review

**Date:** 2026-06-05
**Purpose:** Prepare the product for outside testing with real users and teams
**Review scope:** Dashboard, public website, all authenticated pages, API routes, database schema, auth, notifications, billing

---

## 1. What Is Working Well

**Visual design and polish.** The UI is clean, modern, and professional. The teal primary color, neutral background, Inter font, glass-effect header, shadow-sm cards, proper spacing, and consistent icon usage create a look that could ship. The dark mode toggle works correctly with `useSyncExternalStore` for hydration safety.

**Dashboard information hierarchy.** The summary cards (monthly obligations, yearly projection, pending, overdue) give an instant pulse on financial obligations. The period tabs (Overview / This Month / This Year) are a good concept. The monthly bar chart and category donut chart are exactly what users want to see first.

**Recurring bill model is structurally correct.** The `bills` -> `bill_occurrences` schema is the right data model for a bill tracker. Separating the bill definition (name, cycle, amount) from its occurrences (due date, status) is exactly how real billing works. The `generateOccurrences` function properly creates 12 months of future instances. The `markOverdue` function correctly flags past-due items.

**Plan gating infrastructure exists.** The `canCreateBill`, `getPlanCapabilities`, and plan-based feature flags (maxBills, aiInsights, csvImport, liveCurrencyConverter) are properly wired into every API route. Stripe checkout, webhook handling, and plan upgrade flow are built.

**Onboarding wizard is present.** A 4-step onboarding flow (name, currency, tags, reminders) exists. This is a good start and shows awareness that first-run experience matters.

**Auth is real.** Supabase integration for email/password and Google OAuth is properly wired on both server (cookie-based SSR client) and client. Login/signup actions use `useActionState` for proper server-action error handling.

**Testing infrastructure.** 60 passing E2E tests (Playwright), unit tests (Vitest) for bills, payments, schema, recurrence, calculator, reminders, currency, plans, CSV, and integration tests for all API routes.

**Import/export scaffolding.** CSV parsing with Papaparse, validation against Zod schemas, preview panel, and CSV generation for export are built.

**Currency conversion scaffolding.** Exchange rate fetching, DB caching, conversion functions, and a singleton store pattern are implemented.

---

## 2. What Could Be Improved

**Dashboard is 100% mock data.** Every page component reads directly from `@/lib/mock/data`. There is zero live data fetching. The dashboard displays the same 12 hardcoded bills, the same 7 upcoming items, the same charts, the same activity feed on every page load for every user. This is the single biggest gap between prototype and product.

**No bill detail/edit/delete.** You can create a bill (optimistically, client-side only) and see it in a card, but you cannot click a bill to view details, edit any field, or delete it. A real user will create a bill with wrong info and need to fix it. Cards are read-only.

**Bill form has no recurrence controls.** The `CreateBillDialog` submits a flat form with name, amount, dueDate, category, priority, tags. There is no cycle selector (one-time/monthly/yearly/custom), no vendor field, no notes field. The `BillForm` component and the dialog only capture a subset of what the schema supports. The API schema (`billInputSchema`) supports cycle/category/priority/tags/notes, but the UI form doesn't expose cycle or notes.

**Status management is confusing.** The mock data uses `status` ("unpaid", "paid", "overdue") as a bill-level property, but the real schema puts status on `bill_occurrences`. The dashboard shows "Overdue" as a status, but overdue should be computed dynamically from `dueDate < today && status != paid`. The UI conflates bill-level and occurrence-level concepts.

**Payments page is thin.** It shows a table with 2 mock payment records and a "Record Payment" dialog. There is no way to select which bill to pay, no line-item selection, no payment method with real validation, and no connection between paying an occurrence and the occurrence status changing.

**Intake center is entirely decorative.** All 5 sources show "Connect" or "Coming soon" buttons, all 3 detected bills are hardcoded mocks. Nothing is actually connected. The intake center page promises Gmail/Sheets/PDF/CSV/Invoicing intake but implements none of it.

**Currency converter uses demo rates.** The exchange rate API endpoint and cron job exist, but the frontend always uses `mockExchangeRates` and never calls the API. The "Live Rates" card is perpetually a Pro upsell.

**No loading/empty/error states for real data.** The dashboard has beautiful skeleton components for charts (`<Skeleton>` in MonthlyBreakdown and CategoryChart), but they're never triggered because data is always immediately available from mock imports. Real data fetching would expose missing loading/error/empty states across many pages.

**Settings are non-persistent.** All settings changes are local `useState`. "Save Changes" button has no handler. Changing currency, name, or notification preferences does nothing.

**Onboarding doesn't persist.** The onboarding wizard collects name, currency, tags, and reminder preferences into local state and then navigates to `/dashboard`. Nothing is saved to the database. The profile table has an `onboardingCompletedAt` field that is never written.

**Team Settings card is misleading.** The Business plan and Team Access section appear in settings but are disabled with "Locked" buttons. This creates an expectation that doesn't exist yet. If teams aren't built, this card should not be shown at all (it creates a false promise).

**No reconciliation between paid/partially-paid.** The `payment_records` table has `paidAmountCents` which could differ from `amountCents` on the occurrence, implying partial payments are supported. But `applyPaymentToOccurrence` just sets status to "paid" -- it doesn't handle partial payment tracking or remaining balance.

---

## 3. What Needs to Change

**All pages must fetch real data.** This is the fundamental blocker. Every page component must become a server component (or use server-side data fetching) that reads from the database via Drizzle, with Supabase auth-derived user IDs. The mock data module should only exist for tests, not for rendered pages.

**Auth must gate every page.** Currently, the `(app)` layout renders `<AppShell>` with no auth check. Any visitor can navigate to `/dashboard`, `/bills`, `/settings`, etc. and see mock data. Pages must redirect to `/login` if no session exists and must scope all data to the authenticated user.

**Bill creation must call the API.** The `CreateBillDialog` uses a `setTimeout` with local state manipulation. It must POST to `/api/bills` with the validated form data. The response should trigger a data refresh (via `router.refresh()` or revalidation).

**Bill status must be occurrence-based.** Stop treating "status" as a bill-level concept. Each bill has occurrences; each occurrence has a status. The dashboard should aggregate counts from occurrences. "Overdue" should be derived from `dueDate < today AND status != 'paid'`. The bill cards on `/bills` should show the next upcoming occurrence status.

**Form fields must match schema.** The bill creation form needs a Billing Cycle selector (one-time/monthly/yearly/custom), a Vendor field (not in the current schema -- needs adding), and a Notes textarea. The current form only captures a subset of fields.

**"Forgot password" link goes to `/forgot-password` which doesn't exist.** This is a dead link on the login page. Either build the page or remove the link.

**Pricing page price inconsistency.** The landing page shows Pro at **$9/month**, but the `/pricing` standalone page and mock pricing data show Pro at **$12/month**. Also the Stripe integration uses `STRIPE_PRO_PRICE_ID` -- whatever that price is in Stripe needs to match what's shown on all marketing and settings pages. This inconsistency will cause immediate user distrust.

**Stats bar claims are unsubstantiated.** The landing page shows "2,400+ businesses use BillFlow" and "85,000+ bills tracked monthly." The product has zero real users. These are fabricated claims. Either remove the stats bar entirely or replace it with truthful data (e.g., "Track unlimited bills," "Set up in 2 minutes"). Fake social proof is worse than none.

**Footer links are all dead.** Documentation, Guides, Blog, Support, About, Privacy, Terms, Contact, Changelog, API -- all link to `#`. Every one of these is a broken promise. Either create placeholder pages or remove the links. A privacy policy and terms of service page are legally recommended (if not required) before collecting user data.

**No logout button.** The sidebar has no sign-out option. A user who logs in cannot log out from the app interface. The `AppSidebar` needs a "Sign Out" action at the bottom.

**No error boundaries.** Any unhandled error in a client component will crash the page to a white screen in production. A root error boundary (`error.tsx`) is missing from the app routes.

---

## 4. What Needs to Be Added

**Bill detail page/panel.** Users need to click a bill card to see: all occurrences (with paid/unpaid/overdue status for each), payment history, attached documents, notes, and edit/delete controls. Without this, bill cards are just read-only labels.

**Vendor/contact field on bills.** The mock data has a `vendor` field but the database schema does not. Users need to track who they owe money to. Add `vendor` (text) to the `bills` table.

**Document/attachment storage.** Users need to attach invoices, PDFs, receipts, or screenshots to bills. This requires a file storage solution (Supabase Storage, S3, or Vercel Blob) and an `attachments` table referencing `bills` or `payment_records`.

**Due-date reminders that actually send.** The notification infrastructure exists (`reminders.ts`, `email.ts`, `push.ts`) and the cron endpoint `/api/cron/reminders` is wired, but the cron endpoint uses hardcoded test data, not real occurrences. The Resend email client and Web Push client need to be instantiated with real API keys and the cron job needs to query real occurrences.

**Search across all bills.** The dashboard has a search input and the bills page has one too, but both are client-side filters over the mock data array. Real search needs to query the database (SQL `ILIKE` on name, vendor, notes, category, tags).

**Pagination/infinite scroll.** The dashboard and bills page render all bills in a grid. With the free plan capped at 25 this may be fine, but the pro plan has no limit. A user with 200+ bills needs paginated or virtualized lists.

**Mobile-responsive bill cards.** The 3-column grid becomes single-column on mobile, which is fine, but there's no mobile testing evidence beyond the sidebar hamburger menu. The dashboard charts (bar chart, pie chart) need to be legible on a phone screen.

**Privacy policy and terms pages.** Before collecting any user emails or payment information, you need a privacy policy and terms of service linked from the footer and signup page. This is a trust signal and potentially a legal requirement.

**Data export that works.** The `/api/export/bills` route returns placeholder data. It needs to query the authenticated user's bills and generate a real CSV. Users will not commit data to a system they cannot get data out of.

**Account deletion.** Users need a way to delete their account and all associated data. This is required for GDPR/CCPA compliance and is a basic trust signal.

**Payment method tracking in settings.** Users may want to store default payment methods (bank account, credit card ending in XXXX, etc.) for reference. The `paymentMethodEnum` exists but there's no UI for managing payment methods at the profile level.

---

## 5. User Adoption Blockers

**No real data persistence visible.** The #1 blocker. A user who signs up, creates a bill, navigates away, and comes back will see the mock data, not their own bill. Everything resets on page reload. This destroys trust instantly.

**No data export.** Users coming from Excel or Google Sheets will not commit data to a system they cannot export. The export endpoint exists but returns placeholder data. Until export works end-to-end, no business will migrate.

**No import that actually works.** The CSV import preview panel looks polished, but there is no file upload actually connected to the API. Users who have hundreds of bills in spreadsheets need a working import path on day one.

**No recurring bill automation.** The schema and recurrence engine exist, but the dashboard shows everything as static occurrences. A user adding a monthly bill expects to see it generate future occurrences -- this needs to be visible and demonstrable.

**No real reminders.** The reminder infrastructure exists (cron, email templates, push notifications) but nothing is actually connected. The most compelling feature for bill-tracking software is "never miss a due date." Without working reminders, the product is just a fancy list.

**Pricing confusion.** $9/mo on landing page vs $12/mo on pricing page. Which is it? This inconsistency will cause immediate distrust and cart abandonment.

**Fake stats.** "2,400+ businesses" makes the product look dishonest to anyone who takes 30 seconds to search. Real businesses and freelancers will not trust a product that fabricates social proof.

**No team/collaboration.** The settings page shows "Team Access" with a "Business" badge and a locked button. A small business owner or office manager evaluating the product will immediately ask: "Can my accountant log in? Can my co-founder see this?" The answer is no. This alone prevents adoption by teams.

**No mobile PWA or notification reliability.** The push notification infrastructure exists but has no client-side registration flow. There's no service worker, no manifest.json for PWA install, and no in-app notification center. Users who manage bills on their phone will look elsewhere.

**No audit log.** Financial software needs an audit trail. Who created this bill? Who marked it paid? When? The schema has `createdAt`/`updatedAt` timestamps but no `createdBy`/`updatedBy` linking to profiles, and no separate audit log table. Without this, there's no accountability in a team setting.

**No permission model.** Even if team accounts were added, there's no role system (admin, editor, viewer). Every user sees and can modify everything. Real teams need read-only roles for accountants and bookkeepers.

---

## 6. Realistic Business Workflow

Here is how a real small business (say, a 5-person digital agency) would use BillFlow, and where the product currently falls short:

### Monday morning -- Weekly review

1. Opens `/dashboard`, expects to see: total due this week, overdue items highlighted, upcoming 7-14 day forecast. **Currently shows hardcoded mock data.**
2. Clicks an "Overdue" summary card to filter. **This filter exists client-side, but the counts update from no real data.**
3. Wants to mark an overdue bill as "disputed" or "waiting on invoice." **No such status exists.**
4. Shares a screenshot with their accountant via WhatsApp. **No sharing/export feature.**

### Mid-month -- Bill entry

1. Receives an AWS invoice via email. Forwards it or drags PDF into the intake center. **Intake is 100% mock.**
2. Manually creates a bill via "New Bill" dialog. Assigns vendor "AWS", recurring monthly, category "Infrastructure". **Form lacks vendor and cycle fields.**
3. Attaches PDF invoice for records. **No attachment storage.**
4. Tags it "ops" and "aws" for filtering. **Tags work, but only client-side.**

### End of month -- Payment run

1. Views all unpaid bills for the month. Filters by "Unpaid" status. **Filter exists but on mock data.**
2. Opens each bill, records payment with method (bank transfer), amount, date, and reference number. **Payments page has no bill selection, no reference number field.**
3. Checks the monthly total against QuickBooks or their bank statement. **No bank reconciliation.**
4. Exports a CSV of all paid bills for the accountant. **Export returns placeholder data.**

### Quarterly -- Planning

1. Views the "This Year" period tab to see annual projections. **Tabs exist but show mock data.**
2. Looks at category pie chart to see where money is going. **Chart uses mock category totals.**
3. Compares Q1 vs Q2 spending. **No comparison or date-range analytics.**

**The workflow breaks at every step because the data layer is missing.** The UI exists, but the product doesn't actually do anything yet.

---

## 7. Priorities

### P0 -- Critical Before Outside Testing

| # | Item | Why | Who needs it |
|---|---|---|---|
| P0-1 | **Wire data fetching to database** | Every page must read from the DB via Drizzle, scoped to `userId`. This is the single gating item -- without it, nothing else matters. | Everyone |
| P0-2 | **Auth gate on all app routes** | Check session in `(app)/layout.tsx`, redirect unauthenticated users to `/login`. Currently any visitor can see the full dashboard. | Everyone |
| P0-3 | **Bill creation -> API** | `CreateBillDialog` must POST to `/api/bills`, not use `setTimeout`. `onBillCreated` should trigger `router.refresh()`. | Everyone |
| P0-4 | **Add vendor field to bills schema** | Add `vendor` text column to the `bills` table. Users cannot track bills without knowing who to pay. | Everyone |
| P0-5 | **Bill detail/edit/delete** | Click a bill card -> see details, occurrences, payment history. Edit fields. Delete/archive a bill. | Everyone |
| P0-6 | **Working data export** | `/api/export/bills` must query the user's real bills and generate CSV. Users won't commit data they can't extract. | Freelancers, accountants, business owners |
| P0-7 | **Fix pricing inconsistency** | Unify Pro price across landing page ($9), pricing page ($12), and Stripe. | Everyone evaluating the product |
| P0-8 | **Remove fake stats** | Replace "2,400+ businesses" and "85,000+ bills tracked" with honest copy describing what the product actually does. | Everyone |
| P0-9 | **Real reminders (cron -> email/push)** | Wire cron to query real occurrences and send via Resend. This is the product's core value proposition. | Everyone |
| P0-10 | **Logout button** | Add sign-out action to sidebar. Basic expected functionality. | Everyone |

### P1 -- Important for a Strong Beta

| # | Item | Why | Who needs it |
|---|---|---|---|
| P1-1 | **Bill form: cycle + vendor + notes fields** | The create/edit form must expose all schema fields so users can set up recurring bills properly. | Everyone |
| P1-2 | **Recurring bill visibility** | After creating a monthly bill, users must see future occurrences on the bill detail page. | Small businesses with subscriptions |
| P1-3 | **Working CSV import** | Connect the file upload UI to `/api/import/preview` and `/api/import/confirm`. | Migrators from Excel/Sheets |
| P1-4 | **Bill occurrence status management** | Move from bill-level "status" to occurrence-level status. Show per-occurrence paid/unpaid/overdue on bill detail. | Everyone tracking due dates |
| P1-5 | **Payment -> occurrence linking** | The "Record Payment" dialog must let users select a specific occurrence, enter payment method/date/amount, and mark it paid. | Office managers, accountants |
| P1-6 | **Settings persistence** | "Save Changes" on settings must update the `profiles` table in the database. | Everyone |
| P1-7 | **Onboarding persistence** | Save onboarding wizard choices to DB, set `onboardingCompletedAt` timestamp. | New users |
| P1-8 | **Privacy policy + terms pages** | Create `/privacy` and `/terms` pages. Link from footer and signup. Required before collecting user data. | Everyone (legal requirement) |
| P1-9 | **Footer links** | Remove dead `#` links or create placeholder pages for Documentation, Support, etc. | Everyone |
| P1-10 | **Forgot password page** | Build `/forgot-password` with Supabase password reset flow or remove the dead link. | Users who forget passwords |
| P1-11 | **Account deletion** | Add "Delete Account" in settings with confirmation dialog and cascading data removal. | GDPR/CCPA compliance |
| P1-12 | **Error boundaries** | Add `error.tsx` to `(app)` and `(public)` route groups to catch unhandled errors gracefully. | Everyone |

### P2 -- Valuable but Can Wait

| # | Item | Why | Who needs it |
|---|---|---|---|
| P2-1 | **Attachment storage** | Supabase Storage + `attachments` table. Attach PDFs/images to bills for record keeping. | Accountants, auditors, organized users |
| P2-2 | **Audit log** | `audit_logs` table (userId, action, targetType, targetId, changes, timestamp). Record creates/edits/deletes/payments. | Teams, businesses with compliance needs |
| P2-3 | **In-app notification center** | Bell icon in sidebar, dropdown of recent events (bill due tomorrow, payment recorded, etc.). | All users |
| P2-4 | **Better search** | Server-side search across name, vendor, notes, category with `ILIKE` for fast filtering. | Users with many bills |
| P2-5 | **Date range analytics** | "Last 3 months", "Q1 vs Q2", custom date range for charts and summaries. | Business owners, accountants |
| P2-6 | **Multiple currency display** | Per-bill original currency + dashboard totals converted to user's default currency. | International freelancers, global teams |
| P2-7 | **PWA manifest + service worker** | Enable "Add to Home Screen" on mobile. Offline-capable cached UI. | Mobile-first users |
| P2-8 | **SMS/WhatsApp reminders** | Alternative notification channels beyond email/push. | Users in markets where email is less used |

### P3 -- Future/Advanced

| # | Item | Why | Who needs it |
|---|---|---|---|
| P3-1 | **Team/workspace support** | Multi-user accounts, roles (admin/editor/viewer), shared bills. | Small businesses, finance teams |
| P3-2 | **Real intake integrations** | Gmail API, Google Sheets API, PDF parsing with AI, invoicing platform APIs. | Users wanting automation |
| P3-3 | **Approval workflows** | Bills require approval before payment. Multi-step approval chains. | Mid-size businesses, enterprises |
| P3-4 | **Cash flow calendar** | Calendar view of all upcoming bills with daily/weekly totals. | CFOs, business owners |
| P3-5 | **Bank reconciliation** | Import bank statements, match transactions to bill payments. | Accountants, bookkeepers |
| P3-6 | **Budget tracking** | Set monthly/quarterly budgets per category, track variance. | Business owners, finance managers |
| P3-7 | **API for external integrations** | REST API with API keys for programmatic access (Zapier, Make, custom integrations). | Power users, developers |
| P3-8 | **Accounting software sync** | QuickBooks/Xero/FreeAgent integration for two-way data sync. | Accountants, businesses with existing workflows |
| P3-9 | **Receipt OCR** | Photo of receipt -> auto-extract vendor, amount, date via AI. | Freelancers tracking expenses |

---

## Summary

The product has excellent visual design, a solid data model, good component architecture, real auth, and good testing coverage. But it is fundamentally a **frontend prototype with mock data** -- not a working application. The UI looks like a real product, which is actually a risk: a tester who signs up and sees the same hardcoded data as every other user will immediately conclude the product is fake.

**The single most important action is connecting every page to the real database with user-scoped queries.** Until then, everything else is cosmetic.

Once the data layer is real, the product's core differentiators become: recurring bill automation, due-date reminders, and CSV import/export. These three features must work end-to-end for any user to choose BillFlow over a spreadsheet.

### Immediate next steps (in order)

1. Add `vendor` column to `bills` schema, run migration
2. Add auth guard to `(app)/layout.tsx` -- redirect unauthenticated users to `/login`
3. Add logout to sidebar
4. Wire dashboard page to fetch from database (replace all mock imports)
5. Wire bills page to database
6. Wire bill creation to POST `/api/bills`
7. Build bill detail page/panel (click card -> view/edit/delete)
8. Wire settings persistence (profile name, currency, notification preferences)
9. Wire onboarding persistence (save to profiles table)
10. Wire `/api/export/bills` to return real data
11. Wire `/api/cron/reminders` to query real occurrences and send email/push
12. Fix pricing consistency across landing, pricing page, and Stripe
13. Remove fake stats from landing page
14. Create `/privacy` and `/terms` placeholder pages
15. Create `/forgot-password` page or remove dead link
16. Add error boundaries to route groups
17. Add account deletion to settings
