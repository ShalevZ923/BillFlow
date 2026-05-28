# BillFlow MVP Design

Date: 2026-05-29

## Context

BillFlow by SeeHy is a dashboard-first SaaS for solo users who manage personal and freelance or professional bills. The MVP should feel like a financial command center: users open one dashboard and immediately understand what they owe, what is coming, what is overdue, how costs break down, and what needs action.

The design is based on the existing product preview at `/home/sz/Desktop/preview.html` and the dashboard mockup direction shared during brainstorming.

## Goals

- Build a launchable MVP, not only a prototype or broad product document.
- Make the dashboard the default daily workspace.
- Keep personal and freelance bills in one combined dashboard with fast filters, tags, and categories.
- Support recurring obligations without hiding unpaid bills.
- Include monetizable Free and Pro plans through Stripe Checkout.
- Use AI as a supporting Pro feature, not as the main product interface.

## Non-Goals

- Team workspaces.
- Business roles and permissions.
- Attachments or document storage.
- OCR invoice extraction.
- Full accounting ledger.
- Excel, PDF, or JSON import/export.
- Multiple dashboards or workspaces in the MVP.
- Business plan implementation. Business can appear as coming later.

## Product Scope

The MVP includes:

- Public home, features, pricing, login, and signup pages.
- Authentication with email/password and Google login.
- Guided onboarding.
- One combined dashboard.
- Bill creation, editing, filtering, and organization.
- Recurring bill series and occurrences.
- Payment records and a Payments tab.
- Email reminders and browser push notifications.
- CSV export for Free users.
- CSV import and export for Pro users.
- Currency-aware bills, dashboard currency switching, and live currency conversion for Pro.
- Pro-only daily AI insights.
- Pro-only text/chat AI Fill for the Add Bill form.
- Free and Pro subscriptions through Stripe Checkout.

## Information Architecture

Signed-out pages:

- Home
- Features
- Pricing
- Login
- Sign Up

Signed-in app:

- Dashboard
- Bills
- Payments
- Currency
- Calculator
- Import/Export
- Settings

The dashboard is the main product surface. Supporting tabs exist for deeper workflows but should not compete with the dashboard as the primary experience.

## Dashboard Design

The dashboard should provide a one-stop view of the user's bill obligations.

Top area:

- Page title and current date.
- Small temporary dashboard currency selector.
- Add Bill button.
- Alert banner for overdue or urgent bills.

Summary cards:

- Monthly obligations.
- Yearly projection.
- Pending payment count and amount.
- Overdue count and amount.

Main diagrams:

- Spending by category.
- Monthly cost breakdown.
- Upcoming 30 days list.

Lower section:

- Bill card grid or compact bill list.
- Search.
- Fast filters for status, category, tags, priority, billing cycle, and personal/freelance tags.
- Sort by due date, amount, priority, or status.

AI insight card:

- Pro-only.
- Shows the latest daily generated insight.
- Summarizes patterns, risk, unusual changes, and suggested next action.
- Uses AI as a compact helper, not as the main dashboard interface.

The dashboard should answer common questions without forcing users to click through multiple pages.

## Bills And Recurrence

An Add/Edit Bill form includes:

- Bill name, required. Example: AWS Invoice.
- Amount, required.
- Currency.
- Due date, required.
- Billing cycle: one-time, monthly, yearly, or custom.
- Category, defaulting to Other.
- Priority: low, medium, high, or critical.
- Status: unpaid, paid, or skipped.
- Tags, entered as comma-separated text.
- Notes.

Recurrence model:

- A recurring bill is a series.
- Each due date is represented by an occurrence.
- The app generates or plans occurrences 12 months ahead.
- If an occurrence is unpaid, it remains unpaid and becomes overdue.
- Future recurring occurrences are still created, so unpaid bills can pile up.
- Paying one occurrence records payment details and does not erase overdue history.

Bill views:

- Dashboard shows bill cards and upcoming items.
- Bills tab gives a full searchable and filterable list.
- Bill detail shows occurrence history, notes, tags, and payment state.

## Payments

The MVP includes a dedicated Payments tab.

A payment record can store:

- Bill occurrence.
- Paid amount.
- Paid date.
- Payment method.
- Note.

Dashboard payment information stays lightweight: paid, unpaid, overdue, due soon, pending total, and overdue total. The Payments tab provides deeper search and filtering by bill, category, date range, status, and payment method.

## Reminders And Notifications

The MVP includes email reminders and browser push notifications. Browser push requires user opt-in.

Default reminder schedule:

- 7 days before the due date.
- 1 day before the due date.
- Overdue after the due date.

Users can turn email and push reminders on or off globally.

## CSV Import And Export

Free users:

- CSV export from the current filtered bill list.

Pro users:

- CSV import.
- CSV export.

CSV import requirements:

- Upload CSV.
- Preview parsed rows.
- Validate before writing data.
- Confirm import before saving bills.

Validation should cover:

- Required fields.
- Amount format.
- Date format.
- Supported currencies.
- Supported billing cycles.
- Supported statuses and priorities.
- Duplicate-looking bill names.

No Excel, PDF, JSON, or attachment handling is included in the MVP.

## Currency

Each bill stores its own currency.

Dashboard:

- Users can temporarily switch the dashboard display currency through a small selector.
- Dashboard totals convert into the selected view currency.
- Temporary switching does not have to update the user's default currency unless explicitly saved later.

Currency tab:

- Pro-only live currency conversion.
- Converts one amount into multiple target currencies at once.
- Shows when exchange rates were last updated.
- Falls back to cached rates if live rates are unavailable.

## AI Features

AI is Pro-only and supporting, not the main product focus.

Daily AI insights:

- Refresh once per day.
- Appear as a compact dashboard card.
- Use structured bill summary data instead of raw private notes by default.
- Suggest upcoming pressure, overdue risk, unusual category concentration, duplicate-looking bills, and next best action.
- If the AI API fails, keep showing the last successful insight with a timestamp.

AI Fill:

- Available inside Add New Bill.
- User can paste invoice/email text or type a short prompt.
- AI suggests bill fields: name, amount, currency, due date, cycle, category, priority, tags, and notes.
- User reviews and confirms before saving.
- AI never creates bills silently.
- OCR invoice upload is not part of the MVP.

## Plans And Billing

Stripe Checkout supports Free and Pro plans in the MVP. Business can be displayed as coming later.

Free:

- Up to 25 bills.
- Manual add/edit.
- Combined dashboard.
- Dashboard currency selector for converted dashboard totals.
- Filters, tags, and categories.
- CSV export.
- Basic reminders.

Pro:

- Unlimited bills.
- Daily AI insights.
- AI Fill.
- CSV import and export.
- Live currency converter.
- Pro dashboard utilities tied to AI, import controls, and unlimited bill volume.

Business later:

- Team members.
- Multiple dashboards or workspaces.
- Roles and permissions.
- Business controls.

## Onboarding

After signup, onboarding asks for:

- User name.
- Default dashboard currency.
- Suggested personal/freelance tags.
- First bill.
- Reminder preferences.

Onboarding should get the user to a useful dashboard quickly without forcing CSV import.

## Technical Shape

The app should be structured around clear modules:

- Auth and plans: users, sessions, Google login, Stripe Free/Pro state.
- Billing domain: bills, recurring series, occurrences, payment records.
- Dashboard domain: aggregation, charts, filters, projections, and dashboard currency conversion.
- Notifications: scheduled reminder jobs for email and browser push.
- Currency service: exchange-rate fetch, cache, and conversion.
- CSV service: import validation, preview, confirm, and export.
- AI service: daily insights and AI Fill with structured inputs and outputs.
- Public site: home, features, pricing, login, and signup entry.

Data flow:

- Users create bills manually, through Pro CSV import, or through Pro AI Fill suggestions.
- Recurrence creates or plans 12 months of occurrences.
- Dashboard reads occurrences and payments to calculate totals, overdue state, charts, and upcoming obligations.
- Payments update occurrence state and payment history.
- Reminders scan occurrences by due date and notification settings.
- AI reads summarized bill/dashboard data once daily for insights.
- AI Fill reads user-provided text and returns suggested form fields for review.

## Tech Stack

The MVP should use a single TypeScript SaaS stack:

- App framework: Next.js App Router with TypeScript.
- Hosting: Vercel.
- UI: Tailwind CSS, shadcn/ui-style components, lucide icons, and Recharts.
- Forms and validation: React Hook Form and Zod.
- Auth: Supabase Auth for email/password and Google login.
- Database: Supabase Postgres.
- ORM and migrations: Drizzle ORM.
- Payments: Stripe Checkout and Stripe Billing webhooks for Free and Pro subscription state.
- AI: OpenAI API with structured outputs for daily insights and AI Fill.
- Email: Resend for reminder emails.
- Browser push: Web Push API with VAPID keys.
- Scheduled jobs: Vercel Cron route handlers for recurrence generation, reminders, exchange-rate refresh, and daily AI insights.
- CSV: Papa Parse for import and export.
- Testing: Vitest, React Testing Library, and Playwright.

This stack keeps the MVP in one repository, supports a dashboard-heavy SaaS UI, avoids custom authentication infrastructure, and gives hosted paths for payments, AI, email, and scheduled jobs without adding a separate backend service too early.

## Error Handling

- Forms show inline validation for required fields, invalid amounts, invalid dates, unsupported currencies, and invalid cycle settings.
- CSV import never writes directly on upload.
- CSV import shows preview, validation errors, and duplicate warnings before confirmation.
- Recurrence jobs are idempotent so repeated runs do not create duplicate occurrences.
- Currency conversion falls back to cached rates when live rates fail.
- AI insight failures keep the last successful insight and timestamp.
- AI Fill failures leave the form unchanged and show a retryable error.
- Stripe failures return the user to billing settings with a clear payment status.
- Email and push failures are logged and retried where reasonable.

## Testing

Unit tests:

- Bill validation.
- Recurrence generation.
- Payment records.
- Dashboard aggregation.
- Currency conversion.
- Plan limits.
- CSV validation.
- AI structured response parsing.

Integration tests:

- Signup and onboarding.
- Add bill.
- Recurring occurrence generation.
- Dashboard aggregation.
- Mark occurrence paid.
- Payment history filtering.
- CSV import preview and confirm.
- CSV export.
- AI Fill review flow.
- Stripe checkout state changes.

UI smoke tests:

- Public site.
- Signup/login.
- Dashboard.
- Add Bill form.
- Bills tab.
- Payments tab.
- Currency tab.
- Import/Export tab.
- Settings.

Scheduled-job tests:

- Reminder scans.
- Recurrence generation idempotency.
- Daily AI insight refresh fallback.
