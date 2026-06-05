# Intake Center Wiring & Unwired UI Fixes

**Date:** 2026-06-05
**Status:** Approved

## Problem

The Intake Center (`/intake`) is fully mock-driven with non-functional Connect/Edit/Approve/Dismiss buttons. Several other small UI elements across the app also lack click handlers (Dashboard Quick Actions, Export CSV button) or use hardcoded state (Settings billing page). The codebase already uses informal `comingSoon` flags and inline badges — these need to be formalized into reusable components.

## Design

### 1. Shared components

**`useComingSoon` hook** (`src/hooks/use-coming-soon.ts`)
- Returns `{ toastElement, showComingSoon }`
- `showComingSoon(message?: string)` sets toast state — defaults to `"This feature is coming soon!"`
- `toastElement` renders the existing `<Toast>` component with `variant="info"`
- Encapsulates the same pattern already used in `src/app/(app)/settings/page.tsx`

**`ComingSoonBadge` component** (`src/components/ui/coming-soon-badge.tsx`)
- Wraps `<Badge variant="warning">Coming soon</Badge>`
- Saves repeating the same markup across files

**`WorkInProgressBanner` component** (`src/components/ui/work-in-progress-banner.tsx`)
- Dismissible yellow banner: "This feature is under active development — some capabilities are coming soon."
- Uses `bg-yellow-50 border-yellow-200 text-yellow-700` (matches existing warning variant)
- Stored in local state — once dismissed, stays hidden for session

### 2. Intake Center wiring

**File:** `src/app/(app)/intake/page.tsx`

- Add `<WorkInProgressBanner />` at top of page
- Add `useComingSoon` hook for toast management
- "Connect" buttons on source cards → `onClick={() => showComingSoon("Source connections are coming soon!")}`
- "Edit" button on detected bill rows → `onClick={() => showComingSoon("Inline editing is coming soon!")}`
- "Approve" button → `onClick={() => showComingSoon("Bill approval workflow is coming soon!")}`
- "Dismiss" button → `onClick={() => showComingSoon("Bill dismissal is coming soon!")}`
- Replace inline `src.comingSoon` badge rendering with `<ComingSoonBadge />`
- Mock data stays; no backend changes

### 3. Dashboard Quick Actions

**File:** `src/app/(app)/dashboard/dashboard-content.tsx`, lines 410-428

Wire the 4 Quick Action buttons to `router.push()`:
- Add Bill → `/bills`
- Import → `/import-export`
- Convert → `/currency`
- Calculate → `/calculator`

Add `"use client"` if not already present, import `useRouter` from `next/navigation`, add `onClick` to each button.

### 4. Export CSV button

**File:** `src/app/(app)/import-export/page.tsx`, lines 196-199

Wire Export CSV button to:
1. `fetch("/api/export/bills")`
2. Get response blob
3. Create object URL, trigger download via hidden `<a>` click
4. Clean up object URL

Show error toast via existing page toast state on failure.

### 5. Settings billing page

**File:** `src/app/(app)/settings/billing/page.tsx`, line 11

Replace `useState<"free" | "pro">("free")` with:
- Read `plan` field from `profiles` table via server component or SWR/fetch
- Default to `"free"` if no profile found
- Could use a simple `fetch("/api/...")` or read from the session/db directly

### 6. Footer "Coming soon" links

**File:** `src/app/(public)/page.tsx`, lines 401-404

- "About — Coming soon" and "Contact — Coming soon" already show as text
- No onClick change needed — they're already non-interactive text
- If they have `cursor-pointer`, remove it

## Scope / Out of scope

**In scope:**
- Reusable `useComingSoon` hook, `ComingSoonBadge`, `WorkInProgressBanner`
- Wire Intake Center buttons to Coming Soon toasts
- Wire Dashboard Quick Actions to navigation
- Wire Export CSV to download
- Fix Settings billing hardcoded plan

**Out of scope:**
- Backend integration for source connections (Gmail, Sheets, PDF scanning)
- Real bill detection pipeline
- AI Insights implementation
- Stripe billing flow changes
- Design Preview page cleanup

## Testing

- Manual verification: click each wired button in Intake Center, Dashboard, Import-Export
- Verify CSV export downloads valid file
- Verify Settings billing shows correct plan from DB
- Verify banner is dismissible and stays dismissed within session
