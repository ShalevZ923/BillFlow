"use server";

import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { profiles, bills, billOccurrences } from "@/db/schema";
import { generateOccurrences } from "@/lib/billing/recurrence";
import type { CurrencyCode, BillingCycle } from "@/lib/billing/types";

type SeedBill = {
  name: string;
  vendor: string;
  amountCents: number;
  currency: CurrencyCode;
  dueDate: string;
  cycle: BillingCycle;
  category: string;
  priority: string;
  tags: string[];
  notes: string;
};

const seedBills: SeedBill[] = [
  {
    name: "Office Rent",
    vendor: "WeWork",
    amountCents: 250000,
    currency: "USD",
    dueDate: "2026-07-01",
    cycle: "monthly",
    category: "Rent",
    priority: "critical",
    tags: ["office", "rent"],
    notes: "Monthly office space"
  },
  {
    name: "AWS Cloud Services",
    vendor: "Amazon Web Services",
    amountCents: 14500,
    currency: "USD",
    dueDate: "2026-07-15",
    cycle: "monthly",
    category: "Cloud",
    priority: "high",
    tags: ["cloud", "infrastructure"],
    notes: "EC2 + S3 + RDS"
  },
  {
    name: "Google Workspace",
    vendor: "Google",
    amountCents: 1200,
    currency: "USD",
    dueDate: "2026-07-10",
    cycle: "monthly",
    category: "SaaS",
    priority: "medium",
    tags: ["email", "productivity"],
    notes: "Team email and docs"
  },
  {
    name: "Business Insurance",
    vendor: "Hiscox",
    amountCents: 85000,
    currency: "USD",
    dueDate: "2026-12-01",
    cycle: "yearly",
    category: "Insurance",
    priority: "high",
    tags: ["insurance"],
    notes: "Annual business liability"
  },
  {
    name: "Internet Provider",
    vendor: "Comcast Business",
    amountCents: 8999,
    currency: "USD",
    dueDate: "2026-07-05",
    cycle: "monthly",
    category: "Utilities",
    priority: "medium",
    tags: ["internet", "utilities"],
    notes: "Business internet 1Gbps"
  }
];

export type OnboardingData = {
  name: string;
  defaultCurrency: CurrencyCode;
  tags: string;
  emailRemindersEnabled: boolean;
  seedSampleData: boolean;
};

export async function completeOnboarding(data: OnboardingData): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const db = createDb();

  await db
    .update(profiles)
    .set({
      name: data.name,
      defaultCurrency: data.defaultCurrency,
      emailRemindersEnabled: data.emailRemindersEnabled,
      onboardingCompletedAt: new Date(),
      updatedAt: new Date()
    })
    .where(eq(profiles.id, user.id));

  if (data.seedSampleData) {
    for (const bill of seedBills) {
      const [inserted] = await db
        .insert(bills)
        .values({
          userId: user.id,
          name: bill.name,
          vendor: bill.vendor,
          amountCents: bill.amountCents,
          currency: bill.currency,
          firstDueDate: bill.dueDate,
          cycle: bill.cycle,
          category: bill.category,
          priority: bill.priority as "low" | "medium" | "high" | "critical",
          tags: bill.tags,
          notes: bill.notes
        })
        .returning();

      if (inserted) {
        const occurrences = generateOccurrences({
          billId: inserted.id,
          userId: user.id,
          startDate: bill.dueDate,
          cycle: bill.cycle,
          amountCents: bill.amountCents,
          currency: bill.currency,
          monthsAhead: 12
        });

        if (occurrences.length > 0) {
          await db.insert(billOccurrences).values(occurrences).onConflictDoNothing();
        }
      }
    }
  }

  return { success: true, message: "Onboarding completed" };
}
