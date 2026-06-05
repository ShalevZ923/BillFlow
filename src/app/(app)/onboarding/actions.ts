"use server";

import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import type { CurrencyCode } from "@/lib/billing/types";

export type OnboardingData = {
  name: string;
  defaultCurrency: CurrencyCode;
  tags: string;
  emailRemindersEnabled: boolean;
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

  return { success: true, message: "Onboarding completed" };
}
