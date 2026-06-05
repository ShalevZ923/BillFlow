import { relations, sql } from "drizzle-orm";
import { boolean, date, integer, jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import type { CurrencyCode } from "@/lib/billing/types";

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
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  vendor: text("vendor").notNull().default(""),
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
    billId: uuid("bill_id")
      .notNull()
      .references(() => bills.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
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
  occurrenceId: uuid("occurrence_id")
    .notNull()
    .references(() => billOccurrences.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  paidAmountCents: integer("paid_amount_cents").notNull(),
  paidCurrency: text("paid_currency").notNull(),
  paidDate: date("paid_date").notNull(),
  method: paymentMethodEnum("method").notNull().default("other"),
  note: text("note").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const exchangeRateSnapshots = pgTable("exchange_rate_snapshots", {
  id: text("id").primaryKey().default("global"),
  base: text("base").$type<CurrencyCode>().notNull().default("USD"),
  rates: jsonb("rates").$type<Record<CurrencyCode, number>>().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  summary: text("summary").notNull(),
  suggestions: jsonb("suggestions").$type<string[]>().notNull(),
  generatedAt: timestamp("generated_at", { withTimezone: true }).notNull().defaultNow()
});

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id").notNull(),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
});

export const pushSubscriptions = pgTable("push_subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => profiles.id, { onDelete: "cascade" }),
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
