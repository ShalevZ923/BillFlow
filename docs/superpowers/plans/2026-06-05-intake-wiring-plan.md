# Intake Center Wiring & Unwired UI Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up the Intake Center with Coming Soon placeholders, add Pro tier gating, fix Dashboard Quick Actions navigation, wire Export CSV download, and fix hardcoded Settings billing plan.

**Architecture:** Create 3 reusable primitives (`useComingSoon` hook, `ComingSoonBadge`, `WorkInProgressBanner`), then apply them to the Intake Center. Wire existing no-op buttons to navigation or API calls. Read real plan from DB for settings billing.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Drizzle ORM, Supabase Auth, Tailwind CSS v4, lucide-react

---

### Task 1: Create `useComingSoon` hook

**Files:**
- Create: `src/hooks/use-coming-soon.ts`

- [ ] **Step 1: Write the hook**

```typescript
"use client";

import { useState, useCallback } from "react";
import { Toast } from "@/components/ui/toast";

export function useComingSoon() {
  const [message, setMessage] = useState<string | null>(null);

  const showComingSoon = useCallback((msg?: string) => {
    setMessage(msg ?? "This feature is coming soon!");
  }, []);

  const dismissToast = useCallback(() => {
    setMessage(null);
  }, []);

  const toastElement = message != null ? (
    <Toast message={message} variant="info" onDismiss={dismissToast} />
  ) : null;

  return { toastElement, showComingSoon };
}
```

- [ ] **Step 2: Verify file exists**

```bash
ls src/hooks/use-coming-soon.ts
```
Expected: `src/hooks/use-coming-soon.ts`

---

### Task 2: Create `ComingSoonBadge` component

**Files:**
- Create: `src/components/ui/coming-soon-badge.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { Badge } from "@/components/ui/badge";

export function ComingSoonBadge() {
  return <Badge variant="warning">Coming soon</Badge>;
}
```

- [ ] **Step 2: Verify file exists**

```bash
ls src/components/ui/coming-soon-badge.tsx
```

---

### Task 3: Create `WorkInProgressBanner` component

**Files:**
- Create: `src/components/ui/work-in-progress-banner.tsx`

- [ ] **Step 1: Write the component**

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function WorkInProgressBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
      <span className="flex-1">
        This feature is under active development — some capabilities are coming
        soon.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Verify file exists**

```bash
ls src/components/ui/work-in-progress-banner.tsx
```

---

### Task 4: Create Intake server action for plan lookup

**Files:**
- Create: `src/app/(app)/intake/actions.ts`

- [ ] **Step 1: Write the server action**

```typescript
"use server";

import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";

export async function getUserPlan(): Promise<"free" | "pro"> {
  const user = await getCurrentUser();
  if (!user) return "free";

  const db = createDb();

  const [profile] = await db
    .select({ plan: profiles.plan })
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  return (profile?.plan as "free" | "pro") ?? "free";
}
```

- [ ] **Step 2: Verify file exists**

```bash
ls src/app/\(app\)/intake/actions.ts
```

---

### Task 5: Wire Intake Center (Pro gate + Coming Soon toasts + banner)

**Files:**
- Modify: `src/app/(app)/intake/page.tsx`

- [ ] **Step 1: Rewrite the intake page**

Replace the entire file with:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, X, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComingSoonBadge } from "@/components/ui/coming-soon-badge";
import { WorkInProgressBanner } from "@/components/ui/work-in-progress-banner";
import { useComingSoon } from "@/hooks/use-coming-soon";
import { mockIntakeSources, mockDetectedBills } from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";
import { getUserPlan } from "./actions";
import Link from "next/link";

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(c: number, code: string): string {
  return `${getSymbol(code)}${formatCents(c)}`;
}

export default function IntakePage() {
  const [detected, setDetected] = useState(mockDetectedBills);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const { toastElement, showComingSoon } = useComingSoon();

  useEffect(() => {
    getUserPlan().then(setPlan);
  }, []);

  function handleApprove() {
    showComingSoon("Bill approval workflow is coming soon!");
  }

  function handleDismiss() {
    showComingSoon("Bill dismissal is coming soon!");
  }

  if (plan === "free") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock size={24} className="text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Intake Center</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          The Intake Center is a Pro feature. Upgrade your plan to connect
          bill sources and automate bill detection.
        </p>
        <Link href="/pricing" className="mt-6">
          <Button>
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    );
  }

  if (plan === null) return null;

  return (
    <div>
      <WorkInProgressBanner />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Intake Center{" "}
          <Badge variant="warning" className="ml-2 align-middle">In Progress</Badge>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your bill sources and manage detected bills in one place.
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-4">Connected Sources</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {mockIntakeSources.map((src) => (
          <div
            key={src.id}
            className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground dark:bg-muted/50">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{src.name}</p>
                <p className="text-xs text-muted-foreground">
                  {src.connected
                    ? `${src.billsFound} bills found`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {src.description}
            </p>
            {src.comingSoon ? (
              <ComingSoonBadge />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  showComingSoon("Source connections are coming soon!")
                }
              >
                <Plus size={12} />
                Connect
              </Button>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">
        Detected Bills{" "}
        {detected.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({detected.length} pending review)
          </span>
        )}
      </h2>
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
        {detected.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No bills to review
          </div>
        ) : (
          <div className="space-y-2">
            {detected.map((det) => (
              <div
                key={det.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-4 dark:bg-muted/20"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-muted/50">
                    {det.source}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {det.vendor}
                  </span>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatCurrency(det.amountCents, det.currency)}
                  </span>
                  {det.invoiceNumber && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      #{det.invoiceNumber}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Due {det.dueDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      det.confidence >= 0.9
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : det.confidence >= 0.8
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {Math.round(det.confidence * 100)}% match
                  </span>
                  {det.duplicateWarning && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      Possible duplicate
                    </span>
                  )}
                  <Button size="xs" onClick={handleApprove}>
                    <Check size={12} />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      showComingSoon("Inline editing is coming soon!")
                    }
                  >
                    Edit
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Mock detected bills — real intake requires connected sources.
        </p>
      </div>

      {toastElement}
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit src/app/\(app\)/intake/page.tsx
```

---

### Task 6: Add Pro badge to sidebar nav item

**Files:**
- Modify: `src/components/layout/app-sidebar.tsx`

- [ ] **Step 1: Add Pro badge next to Intake Center label**

Import `Badge` at top:

```tsx
import { Badge } from "@/components/ui/badge";
```

Then in the nav item rendering (lines 149-155), change the section inside `{!collapsed &&` to show a Pro badge after the Intake Center label:

Find:
```tsx
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
```

Replace with:
```tsx
              {!collapsed && (
                <span className="flex-1 truncate">{item.label}</span>
              )}
              {!collapsed && item.key === "intake" && (
                <Badge variant="warning" className="shrink-0 text-[10px] px-1.5 py-0 h-4">
                  Pro
                </Badge>
              )}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit src/components/layout/app-sidebar.tsx
```

---

### Task 7: Wire Dashboard Quick Actions

**Files:**
- Modify: `src/app/(app)/dashboard/dashboard-content.tsx`

- [ ] **Step 1: Add useRouter import**

The file already imports `useState, useMemo, useEffect, useCallback, useRef` from React. Add `useRouter` from `next/navigation`. The file already has `"use client"` at line 1.

Add the import after the existing React import line (line 3):

```tsx
import { useRouter } from "next/navigation";
```

- [ ] **Step 2: Get router instance**

Inside the `DashboardContent` function (around line 230-235 where state is initialized), add:

```tsx
const router = useRouter();
```

- [ ] **Step 3: Wire Quick Action buttons**

Replace the Quick Actions button block (lines 413-427) by adding `onClick` and route map:

Find:
```tsx
              {[
                { icon: Plus, label: "Add Bill" },
                { icon: Upload, label: "Import" },
                { icon: Globe, label: "Convert" },
                { icon: Calculator, label: "Calculate" }
              ].map((action) => (
                <button
                  key={action.label}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background p-3 text-xs font-medium transition hover:bg-muted hover:border-primary/30 dark:bg-muted/20"
                >
                  <action.icon size={16} className="text-primary" />
                  {action.label}
                </button>
              ))}
```

Replace with:
```tsx
              {[
                { icon: Plus, label: "Add Bill", href: "/bills" },
                { icon: Upload, label: "Import", href: "/import-export" },
                { icon: Globe, label: "Convert", href: "/currency" },
                { icon: Calculator, label: "Calculate", href: "/calculator" }
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background p-3 text-xs font-medium transition hover:bg-muted hover:border-primary/30 dark:bg-muted/20"
                >
                  <action.icon size={16} className="text-primary" />
                  {action.label}
                </button>
              ))}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

---

### Task 8: Wire Export CSV button

**Files:**
- Modify: `src/app/(app)/import-export/page.tsx`

- [ ] **Step 1: Add handing state and export handler**

The file already has the `billCount` state and a `useEffect` fetching it. Add an `exporting` state and an `exportError` state.

After line 50 (`const [billCount, setBillCount] = useState<number | null>(null);`), add:

```tsx
const [exporting, setExporting] = useState(false);
const [exportError, setExportError] = useState<string | null>(null);
```

- [ ] **Step 2: Add handleExport function**

Add before the `return` statement (after the `handleFileSelected` function, around line 55):

```tsx
async function handleExport() {
  setExporting(true);
  setExportError(null);
  try {
    const res = await fetch("/api/export/bills");
    if (!res.ok) throw new Error("Failed to export bills");
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bills-export.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch {
    setExportError("Failed to export bills. Please try again.");
  } finally {
    setExporting(false);
  }
}
```

- [ ] **Step 3: Wire the Export CSV button**

Replace the button (lines 196-199):

```tsx
              <Button size="sm">
                <Download size={14} />
                Export CSV
              </Button>
```

With:

```tsx
              <Button size="sm" onClick={handleExport} disabled={exporting}>
                {exporting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Download size={14} />
                )}
                {exporting ? "Exporting..." : "Export CSV"}
              </Button>
```

- [ ] **Step 4: Add error message display**

After the closing `</div>` of the export card (after line 200, before `</CardContent>`), add:

```tsx
            {exportError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                <AlertTriangle size={14} />
                {exportError}
              </div>
            )}
```

Make sure `AlertTriangle` is imported (already in line 4: `import { Download, Upload as UploadIcon, FileText, Check, AlertTriangle, Loader2, XCircle } from "lucide-react";`).

- [ ] **Step 5: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

---

### Task 9: Fix Settings billing page — read plan from DB

**Files:**
- Modify: `src/app/(app)/settings/billing/page.tsx`

- [ ] **Step 1: Rewrite billing page**

Replace the entire file with:

```tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getProfile } from "@/app/(app)/settings/actions";

export default function BillingSettingsPage() {
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((profile) => {
      setPlan((profile?.plan as "free" | "pro") ?? "free");
      setLoading(false);
    }).catch(() => {
      setPlan("free");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <div>
          <Skeleton className="h-7 w-24 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="mt-6 space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and billing details.</p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={plan === "pro" ? "success" : "default"}>
                {plan === "pro" ? "Pro" : "Free"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {plan === "free"
                  ? "Up to 25 bills, dashboard, CSV export, basic reminders"
                  : "Unlimited bills, AI insights, AI Fill, CSV import/export, live currency converter"}
              </span>
            </div>

            {plan === "free" && (
              <div className="mt-4">
                <Link href="/pricing">
                  <Button>
                    Upgrade to Pro
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pro Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Unlimited bills</li>
              <li>AI-powered daily insights</li>
              <li>AI Fill for quick bill creation</li>
              <li>CSV import for bulk bill management</li>
              <li>Live multi-currency converter</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

---

### Task 10: Verify everything builds

**Files:** None (verification only)

- [ ] **Step 1: Run full TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No errors.

- [ ] **Step 2: Run lint**

```bash
npx eslint src/hooks/use-coming-soon.ts src/components/ui/coming-soon-badge.tsx src/components/ui/work-in-progress-banner.tsx src/app/\(app\)/intake/ src/app/\(app\)/dashboard/dashboard-content.tsx src/app/\(app\)/import-export/page.tsx src/app/\(app\)/settings/billing/page.tsx src/components/layout/app-sidebar.tsx --max-warnings 0
```
Expected: No warnings or errors.

- [ ] **Step 3: Run tests**

```bash
pnpm vitest run
```
Expected: All existing tests pass.

---
