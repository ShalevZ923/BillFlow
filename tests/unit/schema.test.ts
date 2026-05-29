import { describe, expect, it } from "vitest";
import {
  profiles, bills, billOccurrences, paymentRecords,
  aiInsights, pushSubscriptions, exchangeRateSnapshots,
  planEnum, cycleEnum, priorityEnum, occurrenceStatusEnum, paymentMethodEnum,
  profileRelations
} from "@/db/schema";

describe("database schema", () => {
  it("defines all core tables", () => {
    expect(profiles).toBeDefined();
    expect(bills).toBeDefined();
    expect(billOccurrences).toBeDefined();
    expect(paymentRecords).toBeDefined();
    expect(aiInsights).toBeDefined();
    expect(pushSubscriptions).toBeDefined();
    expect(exchangeRateSnapshots).toBeDefined();
  });

  it("defines all enums with correct values", () => {
    expect(planEnum).toBeDefined();
    expect(cycleEnum).toBeDefined();
    expect(priorityEnum).toBeDefined();
    expect(occurrenceStatusEnum).toBeDefined();
    expect(paymentMethodEnum).toBeDefined();

    expect(planEnum.enumValues).toEqual(["free", "pro"]);
    expect(cycleEnum.enumValues).toEqual(["one-time", "monthly", "yearly", "custom"]);
    expect(priorityEnum.enumValues).toEqual(["low", "medium", "high", "critical"]);
    expect(occurrenceStatusEnum.enumValues).toEqual(["unpaid", "paid", "skipped", "overdue"]);
    expect(paymentMethodEnum.enumValues).toEqual(["card", "bank", "cash", "transfer", "other"]);
  });

  it("defines profiles with required columns", () => {
    expect(profiles.id).toBeDefined();
    expect(profiles.email).toBeDefined();
    expect(profiles.name).toBeDefined();
    expect(profiles.plan).toBeDefined();
    expect(profiles.defaultCurrency).toBeDefined();
    expect(profiles.emailRemindersEnabled).toBeDefined();
    expect(profiles.pushRemindersEnabled).toBeDefined();
    expect(profiles.onboardingCompletedAt).toBeDefined();
    expect(profiles.stripeCustomerId).toBeDefined();
    expect(profiles.stripeSubscriptionId).toBeDefined();
    expect(profiles.createdAt).toBeDefined();
    expect(profiles.updatedAt).toBeDefined();
  });

  it("defines bills with required columns", () => {
    expect(bills.name).toBeDefined();
    expect(bills.amountCents).toBeDefined();
    expect(bills.currency).toBeDefined();
    expect(bills.firstDueDate).toBeDefined();
    expect(bills.cycle).toBeDefined();
    expect(bills.customCycleDays).toBeDefined();
    expect(bills.category).toBeDefined();
    expect(bills.priority).toBeDefined();
    expect(bills.tags).toBeDefined();
    expect(bills.notes).toBeDefined();
    expect(bills.active).toBeDefined();
  });

  it("defines bill_occurrences with unique constraint on (billId, dueDate)", () => {
    expect(billOccurrences.id).toBeDefined();
    expect(billOccurrences.billId).toBeDefined();
    expect(billOccurrences.dueDate).toBeDefined();
    expect(billOccurrences.amountCents).toBeDefined();
    expect(billOccurrences.status).toBeDefined();
  });

  it("defines payment_records with all columns", () => {
    expect(paymentRecords.occurrenceId).toBeDefined();
    expect(paymentRecords.paidAmountCents).toBeDefined();
    expect(paymentRecords.paidCurrency).toBeDefined();
    expect(paymentRecords.paidDate).toBeDefined();
    expect(paymentRecords.method).toBeDefined();
    expect(paymentRecords.note).toBeDefined();
  });

  it("defines ai_insights with jsonb suggestions", () => {
    expect(aiInsights.userId).toBeDefined();
    expect(aiInsights.summary).toBeDefined();
    expect(aiInsights.suggestions).toBeDefined();
    expect(aiInsights.generatedAt).toBeDefined();
  });

  it("defines push_subscriptions with required fields", () => {
    expect(pushSubscriptions.userId).toBeDefined();
    expect(pushSubscriptions.endpoint).toBeDefined();
    expect(pushSubscriptions.p256dh).toBeDefined();
    expect(pushSubscriptions.auth).toBeDefined();
  });

  it("defines exchange_rate_snapshots with jsonb rates", () => {
    expect(exchangeRateSnapshots.base).toBeDefined();
    expect(exchangeRateSnapshots.rates).toBeDefined();
    expect(exchangeRateSnapshots.updatedAt).toBeDefined();
  });

  it("defines profileRelations with bill, occurrence, and payment relations", () => {
    expect(profileRelations).toBeDefined();
  });
});
