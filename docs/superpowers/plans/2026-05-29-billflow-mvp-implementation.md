# BillFlow MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the dashboard-first BillFlow MVP described in `docs/superpowers/specs/2026-05-29-billflow-mvp-design.md`.

**Architecture:** Use one Next.js App Router application with focused domain modules under `src/lib`, route handlers under `src/app/api`, reusable UI under `src/components`, and Drizzle-managed Supabase Postgres schema under `src/db`. The app ships in progressively testable slices: foundation, domain model, dashboard, app workflows, then external integrations.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui-style components, lucide-react, Recharts, React Hook Form, Zod, Supabase Auth/Postgres, Drizzle ORM, Stripe Checkout, OpenAI structured outputs, Resend, Web Push, Vercel Cron, Papa Parse, Vitest, React Testing Library, Playwright.

---

## Scope Check

The approved MVP spans several subsystems: public site, auth, billing domain, dashboard, payments, CSV, currency, AI, subscriptions, notifications, and scheduled jobs. They are integrated through the same user, bill, occurrence, and plan data model, so this plan keeps them in one ordered MVP plan rather than splitting separate specs. Each task below should leave the repo in a working, testable state and be committed before moving on.

## Target File Structure

- `package.json`: scripts and dependencies.
- `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`: app toolchain config.
- `src/app/(public)/*`: signed-out marketing, pricing, login, and signup pages.
- `src/app/(app)/*`: signed-in app pages for dashboard, bills, payments, currency, calculator, import/export, and settings.
- `src/app/api/*`: route handlers for Stripe, AI, CSV, cron, push, and app mutations that need server-side secrets.
- `src/components/layout/*`: public and app layouts.
- `src/components/ui/*`: shared primitives such as button, card, input, select, badge, alert, dialog, tabs, table, and form field wrappers.
- `src/components/dashboard/*`: dashboard cards, charts, filters, upcoming list, and AI insight card.
- `src/components/bills/*`: Add/Edit Bill form, AI Fill panel, bill cards, and bill details.
- `src/components/payments/*`: payment history table and payment form.
- `src/components/currency/*`: dashboard currency selector and multi-currency converter.
- `src/db/schema.ts`: Drizzle table definitions.
- `src/db/client.ts`: database client.
- `src/db/migrations/*`: generated SQL migrations.
- `src/lib/auth/*`: Supabase server/client helpers and session helpers.
- `src/lib/plans/*`: Free/Pro plan limits and feature gates.
- `src/lib/billing/*`: bill validation, recurrence, occurrence status, payment records, and dashboard queries.
- `src/lib/dashboard/*`: aggregation and chart payload builders.
- `src/lib/currency/*`: exchange-rate cache, conversion, and supported currency metadata.
- `src/lib/csv/*`: CSV import validation and export generation.
- `src/lib/ai/*`: OpenAI client, schemas, daily insight generation, and AI Fill.
- `src/lib/notifications/*`: email, push subscriptions, reminder selection, and send logic.
- `src/lib/stripe/*`: checkout session creation, webhook handling, and subscription state mapping.
- `src/lib/test/*`: factories and mocks.
- `tests/unit/*`: domain and service tests.
- `tests/integration/*`: route handler and workflow tests.
- `tests/e2e/*`: Playwright smoke tests.

## Environment Variables

Create `.env.example` in Task 1 with these keys:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRO_PRICE_ID=
OPENAI_API_KEY=
RESEND_API_KEY=
REMINDER_FROM_EMAIL=BillFlow <reminders@example.com>
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
CRON_SECRET=
EXCHANGE_RATE_API_URL=https://api.exchangerate.host/latest
```

## Task 1: Project Foundation

**Files:**
- Create: `package.json`
- Create: `next.config.ts`
- Create: `tsconfig.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.mjs`
- Create: `vitest.config.ts`
- Create: `playwright.config.ts`
- Create: `.env.example`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.tsx`
- Create: `src/lib/env.ts`
- Create: `tests/unit/env.test.ts`

- [ ] **Step 1: Create the package manifest**

Create `package.json` with these scripts and dependency groups:

```json
{
  "name": "billflow",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "check": "pnpm run typecheck && pnpm run test && pnpm run build"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.0.0",
    "@supabase/ssr": "^0.6.0",
    "@supabase/supabase-js": "^2.49.0",
    "class-variance-authority": "^0.7.1",
    "clsx": "^2.1.1",
    "date-fns": "^4.1.0",
    "drizzle-orm": "^0.43.0",
    "lucide-react": "^0.511.0",
    "next": "^15.3.0",
    "openai": "^4.100.0",
    "papaparse": "^5.5.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-hook-form": "^7.56.0",
    "recharts": "^2.15.0",
    "resend": "^4.5.0",
    "stripe": "^18.0.0",
    "tailwind-merge": "^3.2.0",
    "tailwindcss-animate": "^1.0.7",
    "web-push": "^3.6.7",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@playwright/test": "^1.52.0",
    "@testing-library/jest-dom": "^6.6.0",
    "@testing-library/react": "^16.3.0",
    "@types/node": "^22.15.0",
    "@types/papaparse": "^5.3.16",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@types/web-push": "^3.6.4",
    "autoprefixer": "^10.4.21",
    "drizzle-kit": "^0.31.0",
    "jsdom": "^26.1.0",
    "postcss": "^8.5.0",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.8.0",
    "vitest": "^3.1.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run:

```bash
pnpm install
```

Expected: `pnpm-lock.yaml` is created and the install exits with code 0.

- [ ] **Step 3: Add config files**

Create standard Next.js, TypeScript, Tailwind, Vitest, and Playwright config files:

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    typedRoutes: true
  }
};

export default nextConfig;
```

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "es2022"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: "hsl(var(--primary))",
        muted: "hsl(var(--muted))",
        destructive: "hsl(var(--destructive))"
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
```

```js
// postcss.config.mjs
const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};

export default config;
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts", "tests/**/*.test.tsx"]
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname
    }
  }
});
```

```ts
// playwright.config.ts
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  webServer: {
    command: "pnpm run dev",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: true
  },
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry"
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } }
  ]
});
```

- [ ] **Step 4: Add environment validation**

Create `src/lib/env.ts`:

```ts
import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_PRO_PRICE_ID: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  RESEND_API_KEY: z.string().optional(),
  REMINDER_FROM_EMAIL: z.string().default("BillFlow <reminders@example.com>"),
  VAPID_PUBLIC_KEY: z.string().optional(),
  VAPID_PRIVATE_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
  EXCHANGE_RATE_API_URL: z.string().url().default("https://api.exchangerate.host/latest")
});

export type AppEnv = z.infer<typeof envSchema>;

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(source);
}
```

Create `tests/unit/env.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("getEnv", () => {
  it("defaults local app url and exchange-rate endpoint", () => {
    const env = getEnv({});

    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.EXCHANGE_RATE_API_URL).toBe("https://api.exchangerate.host/latest");
  });

  it("rejects invalid urls", () => {
    expect(() => getEnv({ NEXT_PUBLIC_APP_URL: "not-a-url" })).toThrow();
  });
});
```

- [ ] **Step 5: Create the base app shell**

Create `src/app/layout.tsx`, `src/app/globals.css`, and `src/app/page.tsx` with a simple public landing page. Use CSS variables and restrained SaaS styling; avoid a decorative landing-only page because the real app is the main product.

- [ ] **Step 6: Run foundation checks**

Run:

```bash
pnpm run typecheck
pnpm run test
pnpm run build
```

Expected: typecheck passes, env tests pass, and Next.js builds.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml next.config.ts tsconfig.json tailwind.config.ts postcss.config.mjs vitest.config.ts playwright.config.ts .env.example src tests
git commit -m "chore: scaffold BillFlow app"
```

## Task 2: Core Types, Plans, And Validation

**Files:**
- Create: `src/lib/plans/limits.ts`
- Create: `src/lib/billing/types.ts`
- Create: `src/lib/billing/validation.ts`
- Create: `tests/unit/plans.test.ts`
- Create: `tests/unit/bill-validation.test.ts`

- [ ] **Step 1: Write plan limit tests**

Create `tests/unit/plans.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { canCreateBill, getPlanCapabilities } from "@/lib/plans/limits";

describe("plan limits", () => {
  it("allows free users below 25 bills and blocks the 26th bill", () => {
    expect(canCreateBill({ plan: "free", currentBillCount: 24 })).toEqual({ allowed: true });
    expect(canCreateBill({ plan: "free", currentBillCount: 25 })).toEqual({
      allowed: false,
      reason: "Free plan supports up to 25 bills"
    });
  });

  it("allows pro users to create unlimited bills and use paid features", () => {
    expect(canCreateBill({ plan: "pro", currentBillCount: 500 })).toEqual({ allowed: true });
    expect(getPlanCapabilities("pro")).toMatchObject({
      aiInsights: true,
      aiFill: true,
      csvImport: true,
      csvExport: true,
      liveCurrencyConverter: true
    });
  });
});
```

- [ ] **Step 2: Implement plan limits**

Create `src/lib/plans/limits.ts`:

```ts
export type Plan = "free" | "pro";

export type PlanCapabilities = {
  maxBills: number | null;
  aiInsights: boolean;
  aiFill: boolean;
  csvImport: boolean;
  csvExport: boolean;
  liveCurrencyConverter: boolean;
};

const capabilities: Record<Plan, PlanCapabilities> = {
  free: {
    maxBills: 25,
    aiInsights: false,
    aiFill: false,
    csvImport: false,
    csvExport: true,
    liveCurrencyConverter: false
  },
  pro: {
    maxBills: null,
    aiInsights: true,
    aiFill: true,
    csvImport: true,
    csvExport: true,
    liveCurrencyConverter: true
  }
};

export function getPlanCapabilities(plan: Plan): PlanCapabilities {
  return capabilities[plan];
}

export function canCreateBill(input: { plan: Plan; currentBillCount: number }): { allowed: true } | { allowed: false; reason: string } {
  const planCapabilities = getPlanCapabilities(input.plan);

  if (planCapabilities.maxBills !== null && input.currentBillCount >= planCapabilities.maxBills) {
    return { allowed: false, reason: "Free plan supports up to 25 bills" };
  }

  return { allowed: true };
}
```

- [ ] **Step 3: Write bill validation tests**

Create `tests/unit/bill-validation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { billInputSchema } from "@/lib/billing/validation";

describe("billInputSchema", () => {
  it("accepts a valid recurring bill", () => {
    const result = billInputSchema.parse({
      name: "AWS Invoice",
      amount: "120.50",
      currency: "USD",
      dueDate: "2026-06-15",
      cycle: "monthly",
      category: "Cloud",
      priority: "medium",
      status: "unpaid",
      tags: "cloud, infrastructure",
      notes: "Production account"
    });

    expect(result.tags).toEqual(["cloud", "infrastructure"]);
    expect(result.amountCents).toBe(12050);
  });

  it("rejects missing names, zero amounts, and invalid dates", () => {
    const result = billInputSchema.safeParse({
      name: "",
      amount: "0",
      currency: "USD",
      dueDate: "31/31/2026",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: ""
    });

    expect(result.success).toBe(false);
  });
});
```

- [ ] **Step 4: Implement billing types and validation**

Create `src/lib/billing/types.ts`:

```ts
export const supportedCurrencies = ["USD", "EUR", "GBP", "ILS"] as const;
export const billingCycles = ["one-time", "monthly", "yearly", "custom"] as const;
export const billPriorities = ["low", "medium", "high", "critical"] as const;
export const occurrenceStatuses = ["unpaid", "paid", "skipped", "overdue"] as const;

export type CurrencyCode = (typeof supportedCurrencies)[number];
export type BillingCycle = (typeof billingCycles)[number];
export type BillPriority = (typeof billPriorities)[number];
export type OccurrenceStatus = (typeof occurrenceStatuses)[number];

export type BillInput = {
  name: string;
  amountCents: number;
  currency: CurrencyCode;
  dueDate: string;
  cycle: BillingCycle;
  category: string;
  priority: BillPriority;
  status: Exclude<OccurrenceStatus, "overdue">;
  tags: string[];
  notes: string;
};
```

Create `src/lib/billing/validation.ts`:

```ts
import { z } from "zod";
import { billPriorities, billingCycles, occurrenceStatuses, supportedCurrencies } from "./types";

function parseAmountToCents(value: string): number {
  const normalized = value.trim();
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("Amount must be a positive number with up to 2 decimals");
  }

  const [whole, decimal = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

function parseTags(value: string): string[] {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export const billInputSchema = z
  .object({
    name: z.string().trim().min(1, "Bill name is required").max(120),
    amount: z.string().transform((value, ctx) => {
      try {
        const cents = parseAmountToCents(value);
        if (cents <= 0) {
          ctx.addIssue({ code: "custom", message: "Amount must be greater than 0" });
          return z.NEVER;
        }
        return cents;
      } catch (error) {
        ctx.addIssue({ code: "custom", message: error instanceof Error ? error.message : "Invalid amount" });
        return z.NEVER;
      }
    }),
    currency: z.enum(supportedCurrencies),
    dueDate: z.string().date(),
    cycle: z.enum(billingCycles),
    category: z.string().trim().min(1).default("Other"),
    priority: z.enum(billPriorities),
    status: z.enum(["unpaid", "paid", "skipped"] satisfies Array<(typeof occurrenceStatuses)[number]>),
    tags: z.string().default("").transform(parseTags),
    notes: z.string().max(2000).default("")
  })
  .transform((value) => ({
    ...value,
    amountCents: value.amount,
    amount: undefined
  }));
```

- [ ] **Step 5: Verify tests**

Run:

```bash
pnpm run test -- tests/unit/plans.test.ts tests/unit/bill-validation.test.ts
pnpm run typecheck
```

Expected: both test files pass and typecheck passes.

- [ ] **Step 6: Commit**

```bash
git add src/lib/plans src/lib/billing tests/unit/plans.test.ts tests/unit/bill-validation.test.ts
git commit -m "feat: add bill validation and plan limits"
```

## Task 3: Database Schema And Supabase Auth Helpers

**Files:**
- Create: `drizzle.config.ts`
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `src/lib/auth/server.ts`
- Create: `src/lib/auth/client.ts`
- Create: `src/lib/auth/session.ts`
- Create: `tests/unit/schema.test.ts`

- [ ] **Step 1: Write schema tests**

Create `tests/unit/schema.test.ts`:

```ts
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
```

- [ ] **Step 2: Add Drizzle config and database client**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? ""
  }
});
```

Create `src/db/client.ts`:

```ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { getEnv } from "@/lib/env";
import * as schema from "./schema";

export function createDb(databaseUrl = getEnv().DATABASE_URL) {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to create a database client");
  }

  return drizzle(postgres(databaseUrl, { prepare: false }), { schema });
}
```

Add `postgres` to dependencies:

```bash
pnpm add postgres
```

- [ ] **Step 3: Create schema**

Create `src/db/schema.ts` with user-owned tables:

```ts
import { relations, sql } from "drizzle-orm";
import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro"]);
export const cycleEnum = pgEnum("billing_cycle", ["one-time", "monthly", "yearly", "custom"]);
export const priorityEnum = pgEnum("bill_priority", ["low", "medium", "high", "critical"]);
export const occurrenceStatusEnum = pgEnum("occurrence_status", ["unpaid", "paid", "skipped", "overdue"]);
export const paymentMethodEnum = pgEnum("payment_method", ["card", "bank", "cash", "transfer", "other"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey(),
  email: text("email").notNull(),
  name: text("name").notNull().default(""),
  plan: planEnum("plan").notNull().default("free"),
  defaultCurrency: text("default_currency").notNull().default("USD"),
  emailRemindersEnabled: boolean("email_reminders_enabled").notNull().default(true),
  pushRemindersEnabled: boolean("push_reminders_enabled").notNull().default(false),
  onboardingCompletedAt: timestamp("onboarding_completed_at", { withTimezone: true }),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const bills = pgTable("bills", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  amountCents: integer("amount_cents").notNull(),
  currency: text("currency").notNull(),
  firstDueDate: date("first_due_date").notNull(),
  cycle: cycleEnum("cycle").notNull(),
  customCycleDays: integer("custom_cycle_days"),
  category: text("category").notNull().default("Other"),
  priority: priorityEnum("priority").notNull().default("medium"),
  tags: text("tags").array().notNull().default(sql`ARRAY[]::text[]`),
  notes: text("notes").notNull().default(""),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
});

export const billOccurrences = pgTable(
  "bill_occurrences",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    billId: uuid("bill_id").notNull().references(() => bills.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
    dueDate: date("due_date").notNull(),
    amountCents: integer("amount_cents").notNull(),
    currency: text("currency").notNull(),
    status: occurrenceStatusEnum("status").notNull().default("unpaid"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow()
  },
  (table) => ({
    billDueUnique: uniqueIndex("bill_occurrences_bill_due_unique").on(table.billId, table.dueDate)
  })
);

export const paymentRecords = pgTable("payment_records", {
  id: uuid("id").primaryKey().defaultRandom(),
  occurrenceId: uuid("occurrence_id").notNull().references(() => billOccurrences.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  paidAmountCents: integer("paid_amount_cents").notNull(),
  paidCurrency: text("paid_currency").notNull(),
  paidDate: date("paid_date").notNull(),
  method: paymentMethodEnum("method").notNull().default("other"),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow()
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => profiles.id, { onDelete: "cascade" }),
  endpoint: text("endpoint").notNull(),
  p256dh: text("p256dh").notNull(),
  auth: text("auth").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const profileRelations = relations(profiles, ({ many }) => ({
  bills: many(bills),
  occurrences: many(billOccurrences),
  payments: many(paymentRecords)
}));
```

- [ ] **Step 4: Add Supabase helpers**

Create server and browser helpers that wrap `@supabase/ssr` and expose `getCurrentUser()` returning `{ id, email }` or `null`. Server helpers must read cookies through Next.js `cookies()`.

- [ ] **Step 5: Generate migration**

Run:

```bash
pnpm drizzle-kit generate
```

Expected: a SQL migration appears in `src/db/migrations`.

- [ ] **Step 6: Verify**

Run:

```bash
pnpm run test -- tests/unit/schema.test.ts
pnpm run typecheck
```

Expected: schema test and typecheck pass.

- [ ] **Step 7: Commit**

```bash
git add package.json pnpm-lock.yaml drizzle.config.ts src/db src/lib/auth tests/unit/schema.test.ts
git commit -m "feat: add database schema and auth helpers"
```

## Task 4: Recurrence And Payment Domain

**Files:**
- Create: `src/lib/billing/recurrence.ts`
- Create: `src/lib/billing/payments.ts`
- Create: `tests/unit/recurrence.test.ts`
- Create: `tests/unit/payments.test.ts`

- [ ] **Step 1: Write recurrence tests**

Create `tests/unit/recurrence.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { generateOccurrences, markOverdue } from "@/lib/billing/recurrence";

describe("generateOccurrences", () => {
  it("generates monthly occurrences for 12 months and keeps unpaid past occurrences", () => {
    const occurrences = generateOccurrences({
      billId: "bill-1",
      userId: "user-1",
      startDate: "2026-01-31",
      cycle: "monthly",
      amountCents: 10000,
      currency: "USD",
      monthsAhead: 12
    });

    expect(occurrences).toHaveLength(12);
    expect(occurrences[0]?.dueDate).toBe("2026-01-31");
    expect(occurrences[1]?.dueDate).toBe("2026-02-28");
    expect(occurrences[11]?.status).toBe("unpaid");
  });

  it("marks unpaid past occurrences overdue without touching future occurrences", () => {
    const result = markOverdue(
      [
        { id: "a", dueDate: "2026-05-01", status: "unpaid" },
        { id: "b", dueDate: "2026-06-01", status: "unpaid" },
        { id: "c", dueDate: "2026-05-01", status: "paid" }
      ],
      "2026-05-29"
    );

    expect(result.map((item) => item.status)).toEqual(["overdue", "unpaid", "paid"]);
  });
});
```

- [ ] **Step 2: Implement recurrence**

Create `src/lib/billing/recurrence.ts`:

```ts
import { addDays, addMonths, addYears, format, isBefore, parseISO } from "date-fns";
import type { BillingCycle, OccurrenceStatus } from "./types";

export type GeneratedOccurrence = {
  billId: string;
  userId: string;
  dueDate: string;
  amountCents: number;
  currency: string;
  status: "unpaid";
};

export function generateOccurrences(input: {
  billId: string;
  userId: string;
  startDate: string;
  cycle: BillingCycle;
  customCycleDays?: number | null;
  amountCents: number;
  currency: string;
  monthsAhead: number;
}): GeneratedOccurrence[] {
  const count = input.cycle === "one-time" ? 1 : input.monthsAhead;
  const firstDate = parseISO(input.startDate);

  return Array.from({ length: count }, (_, index) => {
    let dueDate = firstDate;
    if (input.cycle === "monthly") dueDate = addMonths(firstDate, index);
    if (input.cycle === "yearly") dueDate = addYears(firstDate, index);
    if (input.cycle === "custom") dueDate = addDays(firstDate, index * (input.customCycleDays ?? 30));

    return {
      billId: input.billId,
      userId: input.userId,
      dueDate: format(dueDate, "yyyy-MM-dd"),
      amountCents: input.amountCents,
      currency: input.currency,
      status: "unpaid"
    };
  });
}

export function markOverdue<T extends { dueDate: string; status: OccurrenceStatus }>(occurrences: T[], today: string): T[] {
  const todayDate = parseISO(today);

  return occurrences.map((occurrence) => {
    if (occurrence.status === "unpaid" && isBefore(parseISO(occurrence.dueDate), todayDate)) {
      return { ...occurrence, status: "overdue" };
    }

    return occurrence;
  });
}
```

- [ ] **Step 3: Write payment tests**

Create `tests/unit/payments.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { paymentRecordSchema, applyPaymentToOccurrence } from "@/lib/billing/payments";

describe("payment records", () => {
  it("validates payment details", () => {
    const payment = paymentRecordSchema.parse({
      occurrenceId: "00000000-0000-4000-8000-000000000001",
      paidAmount: "99.99",
      paidCurrency: "USD",
      paidDate: "2026-05-29",
      method: "card",
      note: "Paid from business card"
    });

    expect(payment.paidAmountCents).toBe(9999);
  });

  it("marks an occurrence paid without deleting history", () => {
    expect(applyPaymentToOccurrence({ id: "occ-1", status: "overdue" })).toEqual({
      id: "occ-1",
      status: "paid"
    });
  });
});
```

- [ ] **Step 4: Implement payments**

Create `src/lib/billing/payments.ts`:

```ts
import { z } from "zod";
import { occurrenceStatuses } from "./types";

function parseAmountToCents(value: string): number {
  const [whole, decimal = ""] = value.trim().split(".");
  return Number(whole) * 100 + Number(decimal.padEnd(2, "0"));
}

export const paymentRecordSchema = z
  .object({
    occurrenceId: z.string().uuid(),
    paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/),
    paidCurrency: z.string().length(3),
    paidDate: z.string().date(),
    method: z.enum(["card", "bank", "cash", "transfer", "other"]),
    note: z.string().max(1000).default("")
  })
  .transform((value) => ({
    ...value,
    paidAmountCents: parseAmountToCents(value.paidAmount),
    paidAmount: undefined
  }));

export function applyPaymentToOccurrence<T extends { id: string; status: (typeof occurrenceStatuses)[number] }>(occurrence: T): T {
  return { ...occurrence, status: "paid" };
}
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm run test -- tests/unit/recurrence.test.ts tests/unit/payments.test.ts
pnpm run typecheck
```

Expected: recurrence and payments tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/billing tests/unit/recurrence.test.ts tests/unit/payments.test.ts
git commit -m "feat: add recurrence and payment domain"
```

## Task 5: Currency Service

**Files:**
- Create: `src/lib/currency/supported.ts`
- Create: `src/lib/currency/conversion.ts`
- Create: `src/lib/currency/rates.ts`
- Create: `tests/unit/currency.test.ts`

- [ ] **Step 1: Write currency tests**

Create `tests/unit/currency.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { convertAmount, convertToMany } from "@/lib/currency/conversion";

describe("currency conversion", () => {
  const rates = {
    base: "USD",
    updatedAt: "2026-05-29T00:00:00.000Z",
    rates: { USD: 1, EUR: 0.9, ILS: 3.7, GBP: 0.78 }
  };

  it("converts cents between currencies", () => {
    expect(convertAmount({ amountCents: 10000, from: "USD", to: "ILS", rates })).toBe(37000);
  });

  it("converts one amount into many target currencies", () => {
    expect(convertToMany({ amountCents: 10000, from: "USD", targets: ["EUR", "GBP"], rates })).toEqual([
      { currency: "EUR", amountCents: 9000 },
      { currency: "GBP", amountCents: 7800 }
    ]);
  });
});
```

- [ ] **Step 2: Implement supported currency metadata and conversion**

Create `src/lib/currency/supported.ts`:

```ts
export const currencyOptions = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "ILS", label: "Israeli Shekel", symbol: "₪" }
] as const;

export type CurrencyCode = (typeof currencyOptions)[number]["code"];
```

Create `src/lib/currency/conversion.ts`:

```ts
import type { CurrencyCode } from "./supported";

export type ExchangeRates = {
  base: CurrencyCode;
  updatedAt: string;
  rates: Record<CurrencyCode, number>;
};

export function convertAmount(input: {
  amountCents: number;
  from: CurrencyCode;
  to: CurrencyCode;
  rates: ExchangeRates;
}): number {
  if (input.from === input.to) return input.amountCents;

  const amountInBase = input.amountCents / input.rates.rates[input.from];
  return Math.round(amountInBase * input.rates.rates[input.to]);
}

export function convertToMany(input: {
  amountCents: number;
  from: CurrencyCode;
  targets: CurrencyCode[];
  rates: ExchangeRates;
}): Array<{ currency: CurrencyCode; amountCents: number }> {
  return input.targets.map((target) => ({
    currency: target,
    amountCents: convertAmount({ amountCents: input.amountCents, from: input.from, to: target, rates: input.rates })
  }));
}
```

- [ ] **Step 3: Implement rate fetch with cache shape**

Create `src/lib/currency/rates.ts` with `fetchExchangeRates(fetcher = fetch)` returning `ExchangeRates`. It must parse API responses into `{ base, updatedAt, rates }`, keep only supported currencies, and throw `Exchange rates response did not include USD, EUR, GBP, and ILS` when any required rate is absent.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run test -- tests/unit/currency.test.ts
pnpm run typecheck
```

Expected: currency tests and typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/currency tests/unit/currency.test.ts
git commit -m "feat: add currency conversion service"
```

## Task 6: Dashboard Aggregation

**Files:**
- Create: `src/lib/dashboard/aggregate.ts`
- Create: `src/lib/dashboard/filters.ts`
- Create: `tests/unit/dashboard-aggregate.test.ts`

- [ ] **Step 1: Write dashboard aggregation tests**

Create `tests/unit/dashboard-aggregate.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { buildDashboardPayload } from "@/lib/dashboard/aggregate";

describe("buildDashboardPayload", () => {
  it("builds summary cards, category totals, monthly breakdown, and upcoming list", () => {
    const payload = buildDashboardPayload({
      today: "2026-05-29",
      dashboardCurrency: "USD",
      rates: {
        base: "USD",
        updatedAt: "2026-05-29T00:00:00.000Z",
        rates: { USD: 1, EUR: 0.9, GBP: 0.78, ILS: 3.7 }
      },
      bills: [
        { id: "bill-1", name: "Office Rent", category: "Rent", priority: "critical", tags: ["office"] },
        { id: "bill-2", name: "GitHub Teams", category: "SaaS", priority: "medium", tags: ["dev"] }
      ],
      occurrences: [
        { id: "occ-1", billId: "bill-1", dueDate: "2026-06-01", amountCents: 280000, currency: "USD", status: "unpaid" },
        { id: "occ-2", billId: "bill-2", dueDate: "2026-06-10", amountCents: 8400, currency: "USD", status: "unpaid" },
        { id: "occ-3", billId: "bill-2", dueDate: "2026-05-01", amountCents: 8400, currency: "USD", status: "overdue" }
      ]
    });

    expect(payload.summary.monthlyObligationsCents).toBe(296800);
    expect(payload.summary.pendingCount).toBe(2);
    expect(payload.summary.overdueCount).toBe(1);
    expect(payload.categoryTotals).toContainEqual({ category: "Rent", amountCents: 280000 });
    expect(payload.upcoming30Days.map((item) => item.name)).toEqual(["Office Rent", "GitHub Teams"]);
  });
});
```

- [ ] **Step 2: Implement dashboard payload builder**

Create `src/lib/dashboard/aggregate.ts` with:

```ts
export type DashboardPayload = {
  summary: {
    monthlyObligationsCents: number;
    yearlyProjectionCents: number;
    pendingCount: number;
    pendingAmountCents: number;
    overdueCount: number;
    overdueAmountCents: number;
  };
  categoryTotals: Array<{ category: string; amountCents: number }>;
  monthlyBreakdown: Array<{ category: string; amountCents: number }>;
  upcoming30Days: Array<{ id: string; billId: string; name: string; dueDate: string; amountCents: number; status: string; daysUntilDue: number }>;
};
```

Implement `buildDashboardPayload()` by joining bill metadata with occurrences, converting amounts to the dashboard currency, counting pending and overdue states, and limiting upcoming items to due dates within 30 days from `today`.

- [ ] **Step 3: Add filter helpers**

Create `src/lib/dashboard/filters.ts` with a pure `filterBills()` function supporting search, status, category, tag, priority, and cycle. Add unit tests in the same dashboard test file for combined filters.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run test -- tests/unit/dashboard-aggregate.test.ts
pnpm run typecheck
```

Expected: dashboard tests and typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dashboard tests/unit/dashboard-aggregate.test.ts
git commit -m "feat: add dashboard aggregation"
```

## Task 7: Public Site And App Layout

**Files:**
- Create: `src/components/layout/public-header.tsx`
- Create: `src/components/layout/app-sidebar.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/ui/button.tsx`
- Create: `src/components/ui/card.tsx`
- Create: `src/components/ui/badge.tsx`
- Create: `src/components/ui/input.tsx`
- Create: `src/app/(public)/page.tsx`
- Create: `src/app/(public)/pricing/page.tsx`
- Create: `src/app/(public)/features/page.tsx`
- Create: `src/app/(public)/login/page.tsx`
- Create: `src/app/(public)/signup/page.tsx`
- Create: `src/app/(app)/layout.tsx`
- Create: `tests/e2e/public-site.spec.ts`

- [ ] **Step 1: Write public smoke test**

Create `tests/e2e/public-site.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("public site exposes product, pricing, and signup paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "BillFlow" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible();
  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(page.getByText("Free")).toBeVisible();
  await expect(page.getByText("Pro")).toBeVisible();
  await expect(page.getByText("Business")).toBeVisible();
});
```

- [ ] **Step 2: Implement shared UI primitives**

Create small `Button`, `Card`, `Badge`, and `Input` components using `clsx` and `tailwind-merge`. Keep cards at `rounded-lg` or smaller and use lucide icons for navigational controls.

- [ ] **Step 3: Implement public pages**

Public pages should use real BillFlow copy from the spec:

```tsx
const pricingPlans = [
  { name: "Free", price: "$0", features: ["25 bills", "Dashboard", "CSV export", "Basic reminders"] },
  { name: "Pro", price: "$12/mo", features: ["Unlimited bills", "AI insights", "AI Fill", "CSV import/export", "Live currency converter"] },
  { name: "Business", price: "Coming later", features: ["Teams", "Multiple dashboards", "Permissions"] }
];
```

- [ ] **Step 4: Implement app sidebar shell**

The signed-in shell navigation must include Dashboard, Bills, Payments, Currency, Calculator, Import/Export, and Settings. Use `layout.tsx` under `src/app/(app)` so all signed-in pages share it.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm run build
pnpm run test:e2e -- tests/e2e/public-site.spec.ts
```

Expected: build passes and Playwright confirms public pages.

- [ ] **Step 6: Commit**

```bash
git add src/components src/app tests/e2e/public-site.spec.ts
git commit -m "feat: add public site and app shell"
```

## Task 8: Add Bill Form And Bills Tab

**Files:**
- Create: `src/components/bills/bill-form.tsx`
- Create: `src/components/bills/bill-card.tsx`
- Create: `src/components/bills/bill-list.tsx`
- Create: `src/app/(app)/bills/page.tsx`
- Create: `src/app/api/bills/route.ts`
- Create: `tests/integration/bills-route.test.ts`
- Create: `tests/e2e/add-bill.spec.ts`

- [ ] **Step 1: Write route tests for creating bills**

Create `tests/integration/bills-route.test.ts` with mocked auth and mocked database insert. Assert that a Free user at 25 bills receives status 402 and that a valid Pro bill creates the bill plus 12 monthly occurrences.

- [ ] **Step 2: Implement `POST /api/bills`**

Create a route handler that:

```ts
const parsed = billInputSchema.safeParse(await request.json());
if (!parsed.success) return Response.json({ error: "Invalid bill", issues: parsed.error.flatten() }, { status: 400 });
const limit = canCreateBill({ plan: profile.plan, currentBillCount });
if (!limit.allowed) return Response.json({ error: limit.reason }, { status: 402 });
```

Then insert the bill and call `generateOccurrences({ monthsAhead: 12 })`; insert occurrences idempotently using the unique `(billId, dueDate)` constraint.

- [ ] **Step 3: Implement the bill form**

`BillForm` must include fields from the spec: Bill Name, Amount, Currency, Due Date, Billing Cycle, Category, Priority, Status, Tags, and Notes. It must use React Hook Form with Zod validation and show inline validation messages.

- [ ] **Step 4: Implement Bills page**

The Bills tab should show a searchable/filterable list and an Add Bill flow. Empty state copy: `Add your first bill to turn the dashboard into a useful financial picture.`

- [ ] **Step 5: Write and run E2E add bill test**

Create `tests/e2e/add-bill.spec.ts` that opens Bills, fills the Add Bill form with AWS Invoice data, submits, and expects the new bill card to appear.

Run:

```bash
pnpm run test -- tests/integration/bills-route.test.ts
pnpm run test:e2e -- tests/e2e/add-bill.spec.ts
pnpm run typecheck
```

Expected: route tests, E2E test, and typecheck pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/bills src/app/api/bills src/app/'(app)'/bills tests/integration/bills-route.test.ts tests/e2e/add-bill.spec.ts
git commit -m "feat: add bill creation workflow"
```

## Task 9: Dashboard UI

**Files:**
- Create: `src/components/dashboard/summary-cards.tsx`
- Create: `src/components/dashboard/category-chart.tsx`
- Create: `src/components/dashboard/monthly-breakdown.tsx`
- Create: `src/components/dashboard/upcoming-list.tsx`
- Create: `src/components/dashboard/dashboard-filters.tsx`
- Create: `src/components/dashboard/ai-insight-card.tsx`
- Create: `src/components/currency/dashboard-currency-selector.tsx`
- Create: `src/app/(app)/dashboard/page.tsx`
- Create: `tests/e2e/dashboard.spec.ts`

- [ ] **Step 1: Write dashboard smoke test**

Create `tests/e2e/dashboard.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("dashboard shows obligation overview", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Monthly Obligations")).toBeVisible();
  await expect(page.getByText("Yearly Projection")).toBeVisible();
  await expect(page.getByText("Spending by Category")).toBeVisible();
  await expect(page.getByText("Upcoming")).toBeVisible();
});
```

- [ ] **Step 2: Implement dashboard components**

Use `buildDashboardPayload()` and render:

- Monthly obligations.
- Yearly projection.
- Pending payments.
- Overdue.
- Spending by category chart with Recharts.
- Monthly cost breakdown with Recharts.
- Upcoming 30 days list.
- All Bills section with search, filters, and sort controls.
- Temporary dashboard currency selector.
- Pro-only AI insight card with an upgrade prompt for Free users.

- [ ] **Step 3: Verify responsiveness**

Run Playwright against desktop and mobile projects:

```bash
pnpm run test:e2e -- tests/e2e/dashboard.spec.ts
```

Expected: dashboard content is visible on desktop and mobile without overlapping text.

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard src/components/currency/dashboard-currency-selector.tsx src/app/'(app)'/dashboard tests/e2e/dashboard.spec.ts
git commit -m "feat: build dashboard command center"
```

## Task 10: Payments Tab

**Files:**
- Create: `src/components/payments/payment-form.tsx`
- Create: `src/components/payments/payment-history-table.tsx`
- Create: `src/app/(app)/payments/page.tsx`
- Create: `src/app/api/payments/route.ts`
- Create: `tests/integration/payments-route.test.ts`
- Create: `tests/e2e/payments.spec.ts`

- [ ] **Step 1: Write payment route test**

Test that posting payment details creates a payment record and marks the occurrence paid:

```ts
expect(response.status).toBe(201);
expect(insertedPayment.paidAmountCents).toBe(120000);
expect(updatedOccurrence.status).toBe("paid");
```

- [ ] **Step 2: Implement `POST /api/payments`**

Validate with `paymentRecordSchema`, insert the payment record, update the occurrence status to `paid`, and return `{ paymentId, occurrenceStatus: "paid" }`.

- [ ] **Step 3: Implement Payments page**

Render a searchable/filterable table with paid amount, paid date, method, note, bill name, category, and status. Include filters for bill, category, date range, status, and method.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run test -- tests/integration/payments-route.test.ts
pnpm run test:e2e -- tests/e2e/payments.spec.ts
pnpm run typecheck
```

Expected: payment workflow tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/components/payments src/app/api/payments src/app/'(app)'/payments tests/integration/payments-route.test.ts tests/e2e/payments.spec.ts
git commit -m "feat: add payment records"
```

## Task 11: CSV Import And Export

**Files:**
- Create: `src/lib/csv/import.ts`
- Create: `src/lib/csv/export.ts`
- Create: `src/app/api/import/preview/route.ts`
- Create: `src/app/api/import/confirm/route.ts`
- Create: `src/app/api/export/bills/route.ts`
- Create: `src/app/(app)/import-export/page.tsx`
- Create: `tests/unit/csv.test.ts`
- Create: `tests/integration/csv-routes.test.ts`

- [ ] **Step 1: Write CSV unit tests**

Create tests for required fields, invalid amount, invalid date, unsupported currency, duplicate-looking bill names, and export respecting filtered rows. Use this sample:

```csv
name,amount,currency,dueDate,cycle,category,priority,status,tags,notes
AWS Invoice,120.50,USD,2026-06-15,monthly,Cloud,medium,unpaid,"cloud, infrastructure",Production account
```

- [ ] **Step 2: Implement CSV import preview**

`parseBillCsv(csvText)` should return:

```ts
type CsvPreview = {
  validRows: Array<{ rowNumber: number; bill: BillInput }>;
  errors: Array<{ rowNumber: number; field: string; message: string }>;
  warnings: Array<{ rowNumber: number; message: string }>;
};
```

Use Papa Parse and `billInputSchema`.

- [ ] **Step 3: Implement plan gates**

`/api/import/preview` and `/api/import/confirm` must return status 403 for Free users with error `CSV import requires Pro`. `/api/export/bills` is available to Free and Pro users.

- [ ] **Step 4: Implement Import/Export page**

Free users see CSV export and a Pro upgrade prompt for import. Pro users see CSV upload, preview table, validation errors, warnings, confirm import, and export.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm run test -- tests/unit/csv.test.ts tests/integration/csv-routes.test.ts
pnpm run typecheck
```

Expected: CSV tests and typecheck pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/csv src/app/api/import src/app/api/export src/app/'(app)'/import-export tests/unit/csv.test.ts tests/integration/csv-routes.test.ts
git commit -m "feat: add csv import and export"
```

## Task 12: Currency Tab And Rate Refresh

**Files:**
- Create: `src/components/currency/currency-converter.tsx`
- Create: `src/app/(app)/currency/page.tsx`
- Create: `src/app/api/currency/convert/route.ts`
- Create: `src/app/api/cron/exchange-rates/route.ts`
- Create: `tests/integration/currency-routes.test.ts`
- Modify: `vercel.json`

- [ ] **Step 1: Write route tests**

Test that Pro users can convert one amount to multiple currencies and Free users receive status 403 with error `Live currency converter requires Pro`.

- [ ] **Step 2: Implement conversion API**

`POST /api/currency/convert` accepts:

```json
{ "amount": "100.00", "from": "USD", "targets": ["EUR", "GBP", "ILS"] }
```

It returns:

```json
{
  "from": "USD",
  "amountCents": 10000,
  "results": [
    { "currency": "EUR", "amountCents": 9000 },
    { "currency": "GBP", "amountCents": 7800 },
    { "currency": "ILS", "amountCents": 37000 }
  ],
  "ratesUpdatedAt": "2026-05-29T00:00:00.000Z"
}
```

- [ ] **Step 3: Implement Currency page**

Pro users get multi-target conversion. Free users see dashboard currency switching explanation and a Pro upgrade card for live conversion.

- [ ] **Step 4: Add cron route and Vercel config**

Create secured `GET /api/cron/exchange-rates` requiring `Authorization: Bearer ${CRON_SECRET}`. It fetches rates, caches them in the database, and returns `{ refreshed: true, updatedAt }`.

Add `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/exchange-rates", "schedule": "0 */6 * * *" }
  ]
}
```

- [ ] **Step 5: Verify**

Run:

```bash
pnpm run test -- tests/integration/currency-routes.test.ts
pnpm run typecheck
```

Expected: conversion route tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/components/currency src/app/api/currency src/app/api/cron/exchange-rates src/app/'(app)'/currency vercel.json tests/integration/currency-routes.test.ts
git commit -m "feat: add live currency conversion"
```

## Task 13: AI Insights And AI Fill

**Files:**
- Create: `src/lib/ai/schemas.ts`
- Create: `src/lib/ai/client.ts`
- Create: `src/lib/ai/insights.ts`
- Create: `src/lib/ai/ai-fill.ts`
- Create: `src/app/api/ai/fill/route.ts`
- Create: `src/app/api/cron/ai-insights/route.ts`
- Modify: `src/components/dashboard/ai-insight-card.tsx`
- Modify: `src/components/bills/bill-form.tsx`
- Modify: `vercel.json`
- Create: `tests/unit/ai.test.ts`
- Create: `tests/integration/ai-routes.test.ts`

- [ ] **Step 1: Write AI schema tests**

Create tests asserting that AI Fill returns a typed suggestion and rejects unsupported currencies:

```ts
expect(aiFillResponseSchema.parse({
  name: "AWS Invoice",
  amount: "120.50",
  currency: "USD",
  dueDate: "2026-06-15",
  cycle: "monthly",
  category: "Cloud",
  priority: "medium",
  tags: ["cloud", "infrastructure"],
  notes: "Extracted from invoice text"
}).currency).toBe("USD");
```

- [ ] **Step 2: Implement schemas**

`src/lib/ai/schemas.ts` must export `aiFillResponseSchema` and `dailyInsightResponseSchema`. Daily insight schema:

```ts
{
  summary: string;
  suggestions: string[];
  riskLevel: "low" | "medium" | "high";
}
```

- [ ] **Step 3: Implement OpenAI client wrapper**

Create `generateStructuredResponse({ system, user, schemaName, schema })` that uses the OpenAI API and returns parsed Zod data. Keep the function isolated so tests can inject a fake model response.

- [ ] **Step 4: Implement AI Fill route**

`POST /api/ai/fill` accepts `{ text: string }`, requires Pro, rejects empty text, sends only the provided text to AI, validates the structured output, and returns `{ suggestion }`. Free users receive 403 with `AI Fill requires Pro`.

- [ ] **Step 5: Implement daily insights cron**

`GET /api/cron/ai-insights` requires `CRON_SECRET`, loads Pro users, builds summarized dashboard data, generates a daily insight, stores it, and leaves existing insight untouched if the AI API fails for one user.

Extend `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/exchange-rates", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/ai-insights", "schedule": "0 6 * * *" }
  ]
}
```

- [ ] **Step 6: Wire AI Fill into Add Bill**

Add a Pro-only `AI Fill` button/panel to `BillForm`. The user pastes invoice or email text, receives suggested fields, and must click `Apply suggestion` before form fields change.

- [ ] **Step 7: Verify**

Run:

```bash
pnpm run test -- tests/unit/ai.test.ts tests/integration/ai-routes.test.ts
pnpm run typecheck
```

Expected: AI tests and typecheck pass.

- [ ] **Step 8: Commit**

```bash
git add src/lib/ai src/app/api/ai src/app/api/cron/ai-insights src/components/dashboard/ai-insight-card.tsx src/components/bills/bill-form.tsx vercel.json tests/unit/ai.test.ts tests/integration/ai-routes.test.ts
git commit -m "feat: add pro ai insights and ai fill"
```

## Task 14: Stripe Checkout And Subscription State

**Files:**
- Create: `src/lib/stripe/client.ts`
- Create: `src/lib/stripe/subscriptions.ts`
- Create: `src/app/api/stripe/checkout/route.ts`
- Create: `src/app/api/stripe/webhook/route.ts`
- Create: `src/app/(app)/settings/billing/page.tsx`
- Create: `tests/integration/stripe-routes.test.ts`

- [ ] **Step 1: Write Stripe route tests**

Test checkout session creation for Free users upgrading to Pro and webhook mapping from active subscription to `profiles.plan = "pro"`.

- [ ] **Step 2: Implement checkout route**

`POST /api/stripe/checkout` requires an authenticated user, creates a Stripe Checkout session with `mode: "subscription"`, `line_items` using `STRIPE_PRO_PRICE_ID`, and success/cancel URLs under `NEXT_PUBLIC_APP_URL`.

- [ ] **Step 3: Implement webhook route**

Verify Stripe signature with `STRIPE_WEBHOOK_SECRET`. Handle:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

Map active/trialing subscriptions to Pro and canceled/incomplete subscriptions to Free.

- [ ] **Step 4: Implement Billing settings page**

Show current plan, Free limits, Pro features, upgrade button, and billing status messages after checkout redirect.

- [ ] **Step 5: Verify**

Run:

```bash
pnpm run test -- tests/integration/stripe-routes.test.ts
pnpm run typecheck
```

Expected: Stripe route tests pass.

- [ ] **Step 6: Commit**

```bash
git add src/lib/stripe src/app/api/stripe src/app/'(app)'/settings/billing tests/integration/stripe-routes.test.ts
git commit -m "feat: add stripe pro subscriptions"
```

## Task 15: Reminders, Email, And Browser Push

**Files:**
- Create: `src/lib/notifications/reminders.ts`
- Create: `src/lib/notifications/email.ts`
- Create: `src/lib/notifications/push.ts`
- Create: `src/app/api/push/subscribe/route.ts`
- Create: `src/app/api/cron/reminders/route.ts`
- Modify: `src/app/(app)/settings/page.tsx`
- Modify: `vercel.json`
- Create: `tests/unit/reminders.test.ts`
- Create: `tests/integration/notifications-routes.test.ts`

- [ ] **Step 1: Write reminder selection tests**

Create `tests/unit/reminders.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { selectReminderEvents } from "@/lib/notifications/reminders";

describe("selectReminderEvents", () => {
  it("selects 7-day, 1-day, and overdue reminders", () => {
    const events = selectReminderEvents({
      today: "2026-05-29",
      occurrences: [
        { id: "seven", dueDate: "2026-06-05", status: "unpaid" },
        { id: "one", dueDate: "2026-05-30", status: "unpaid" },
        { id: "overdue", dueDate: "2026-05-20", status: "overdue" }
      ]
    });

    expect(events.map((event) => event.type)).toEqual(["seven-day", "one-day", "overdue"]);
  });
});
```

- [ ] **Step 2: Implement reminder selector**

Create `selectReminderEvents()` that returns only unpaid or overdue occurrences matching 7-day, 1-day, or overdue reminder timing for the current date.

- [ ] **Step 3: Implement email and push senders**

Email sender uses Resend. Push sender uses `web-push` with VAPID keys. Both functions accept explicit dependencies so tests can pass fakes:

```ts
sendReminderEmail({ to, billName, dueDate, amountLabel, type }, resendClient)
sendPushReminder({ subscription, title, body }, webPushClient)
```

- [ ] **Step 4: Add push subscription route and settings toggles**

`POST /api/push/subscribe` stores endpoint, p256dh, and auth for the current user. Settings page toggles global email and push reminders.

- [ ] **Step 5: Add cron route**

`GET /api/cron/reminders` requires `CRON_SECRET`, selects reminder events, sends enabled email and push notifications, logs failures, and returns counts `{ emailSent, pushSent, failed }`.

Extend `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/cron/exchange-rates", "schedule": "0 */6 * * *" },
    { "path": "/api/cron/ai-insights", "schedule": "0 6 * * *" },
    { "path": "/api/cron/reminders", "schedule": "0 8 * * *" }
  ]
}
```

- [ ] **Step 6: Verify**

Run:

```bash
pnpm run test -- tests/unit/reminders.test.ts tests/integration/notifications-routes.test.ts
pnpm run typecheck
```

Expected: reminder and notification tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/lib/notifications src/app/api/push src/app/api/cron/reminders src/app/'(app)'/settings vercel.json tests/unit/reminders.test.ts tests/integration/notifications-routes.test.ts
git commit -m "feat: add reminders and notifications"
```

## Task 16: Onboarding And Auth Pages

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/(public)/login/actions.ts`
- Create: `src/app/(public)/signup/actions.ts`
- Create: `src/app/(app)/onboarding/page.tsx`
- Create: `src/app/(app)/onboarding/actions.ts`
- Create: `tests/e2e/onboarding.spec.ts`

- [ ] **Step 1: Write onboarding smoke test**

Create Playwright test for a mocked signed-in user that visits onboarding, enters name, default currency, starter tags, first bill, and reminder preferences, then lands on dashboard.

- [ ] **Step 2: Implement auth pages**

Login and signup pages support email/password and Google login. Google login calls Supabase OAuth. Email forms use server actions and show inline errors.

- [ ] **Step 3: Implement onboarding**

Onboarding fields:

- User name.
- Default dashboard currency.
- Suggested personal/freelance tags.
- First bill through the same bill validation schema.
- Email and push reminder preferences.

After completion, update `profiles.onboardingCompletedAt` and redirect to `/dashboard`.

- [ ] **Step 4: Verify**

Run:

```bash
pnpm run test:e2e -- tests/e2e/onboarding.spec.ts
pnpm run typecheck
```

Expected: onboarding smoke test and typecheck pass.

- [ ] **Step 5: Commit**

```bash
git add src/app/auth src/app/'(public)'/login src/app/'(public)'/signup src/app/'(app)'/onboarding tests/e2e/onboarding.spec.ts
git commit -m "feat: add auth pages and onboarding"
```

## Task 17: Calculator And Settings Completion

**Files:**
- Create: `src/lib/calculator/financial.ts`
- Create: `src/components/calculator/calculator-panel.tsx`
- Create: `src/app/(app)/calculator/page.tsx`
- Modify: `src/app/(app)/settings/page.tsx`
- Create: `tests/unit/calculator.test.ts`
- Create: `tests/e2e/app-navigation.spec.ts`

- [ ] **Step 1: Write calculator tests**

Test monthly-to-yearly, yearly-to-monthly, percentage change, and simple arithmetic totals.

- [ ] **Step 2: Implement calculator module and page**

Calculator page includes simple arithmetic and financial helpers for monthly/yearly comparisons, subscription projections, percentage changes, and budget forecasting.

- [ ] **Step 3: Complete Settings page**

Settings includes profile name, default currency, reminder toggles, billing link, and account sign-out.

- [ ] **Step 4: Verify navigation**

Create E2E test that sidebar links reach Dashboard, Bills, Payments, Currency, Calculator, Import/Export, and Settings.

Run:

```bash
pnpm run test -- tests/unit/calculator.test.ts
pnpm run test:e2e -- tests/e2e/app-navigation.spec.ts
pnpm run typecheck
```

Expected: calculator and navigation tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/calculator src/components/calculator src/app/'(app)'/calculator src/app/'(app)'/settings tests/unit/calculator.test.ts tests/e2e/app-navigation.spec.ts
git commit -m "feat: complete calculator and settings"
```

## Task 18: Final Verification And MVP Hardening

**Files:**
- Create: `scripts/check.sh`
- Create: `docs/env-setup.md`
- Modify: `README.md`
- Modify: `.gitignore`

- [ ] **Step 1: Add check script**

Create `scripts/check.sh`:

```bash
#!/usr/bin/env bash
set -euo pipefail

pnpm run typecheck
pnpm run test
pnpm run build
pnpm run test:e2e
```

Make it executable:

```bash
chmod +x scripts/check.sh
```

- [ ] **Step 2: Add docs**

Create `docs/env-setup.md` documenting each environment variable from `.env.example`, which provider supplies it, and whether it is required for local development, production, or optional Pro-only integrations.

Create `README.md` with:

- Product summary.
- Tech stack.
- Local setup.
- Test commands.
- MVP feature list.
- Deployment notes for Vercel, Supabase, Stripe, OpenAI, Resend, and VAPID keys.

- [ ] **Step 3: Run full verification**

Run:

```bash
./scripts/check.sh
```

Expected: typecheck, unit/integration tests, production build, and Playwright tests pass.

- [ ] **Step 4: Inspect git state**

Run:

```bash
git status --short --branch
```

Expected: only intended documentation/script changes are present.

- [ ] **Step 5: Commit**

```bash
git add scripts/check.sh docs/env-setup.md README.md .gitignore
git commit -m "docs: add setup and verification guide"
```

## Final Acceptance Criteria

- Public home, features, pricing, login, and signup pages exist.
- Email/password and Google login are wired through Supabase.
- Onboarding collects name, currency, starter tags, first bill, and reminder preferences.
- Dashboard shows monthly obligations, yearly projection, pending payments, overdue, category chart, monthly breakdown, upcoming 30 days, filters, search, bill cards, currency selector, and Pro AI insight card.
- Add/Edit Bill supports required fields, cycles, category, priority, status, tags, and notes.
- Recurring bills generate or plan 12 months of occurrences, and unpaid occurrences remain visible as overdue while future obligations continue.
- Payments tab records paid amount, paid date, method, and note.
- Free plan supports 25 bills, CSV export, dashboard currency totals, filters, tags, and reminders.
- Pro plan supports unlimited bills, AI daily insights, AI Fill, CSV import/export, and live currency converter.
- Stripe Checkout and webhooks update Free/Pro state.
- CSV import previews and validates before writing.
- Currency tab converts one amount into multiple target currencies and shows rate timestamp.
- Reminder cron sends email and push notifications for 7-day, 1-day, and overdue reminders.
- AI cron keeps last successful insight when OpenAI fails.
- No MVP support for teams, attachments, OCR, Excel, PDF, JSON, full accounting ledger, or multiple dashboards.
- `./scripts/check.sh` passes.

## Plan Self-Review Notes

- Spec coverage: every approved spec section maps to at least one task.
- Placeholder scan: the plan avoids unresolved markers, vague validation tasks, and cross-task shorthand.
- Type consistency: use `amountCents`, `dueDate`, `cycle`, `priority`, `status`, `tags`, `Plan`, `CurrencyCode`, and `OccurrenceStatus` consistently across schema, validation, dashboard, CSV, AI, and UI modules.
