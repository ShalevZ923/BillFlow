"use server";

import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { profiles } from "@/db/schema";
import { logAuditEvent } from "@/lib/audit/log";
import type { CurrencyCode } from "@/lib/billing/types";

export type ProfileData = {
  name: string;
  email: string;
  plan: string;
  defaultCurrency: CurrencyCode;
  emailRemindersEnabled: boolean;
  pushRemindersEnabled: boolean;
};

export async function getProfile(): Promise<ProfileData | null> {
  const user = await getCurrentUser();
  if (!user) return null;

  const db = createDb();

  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.id, user.id))
    .limit(1);

  if (!profile) {
    return {
      name: "",
      email: user.email,
      plan: "free",
      defaultCurrency: "USD",
      emailRemindersEnabled: true,
      pushRemindersEnabled: false
    };
  }

  return {
    name: profile.name,
    email: profile.email,
    plan: profile.plan,
    defaultCurrency: profile.defaultCurrency as CurrencyCode,
    emailRemindersEnabled: profile.emailRemindersEnabled,
    pushRemindersEnabled: profile.pushRemindersEnabled
  };
}

export type UpdateProfileInput = {
  name?: string;
  defaultCurrency?: CurrencyCode;
  emailRemindersEnabled?: boolean;
  pushRemindersEnabled?: boolean;
};

export async function updateProfile(data: UpdateProfileInput): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const db = createDb();

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.defaultCurrency !== undefined) updateData.defaultCurrency = data.defaultCurrency;
  if (data.emailRemindersEnabled !== undefined) updateData.emailRemindersEnabled = data.emailRemindersEnabled;
  if (data.pushRemindersEnabled !== undefined) updateData.pushRemindersEnabled = data.pushRemindersEnabled;

  await db.update(profiles).set(updateData).where(eq(profiles.id, user.id));

  return { success: true, message: "Profile updated" };
}

export async function deleteAccount(): Promise<{ success: boolean; message: string }> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Not authenticated" };
  }

  const db = createDb();

  await db.delete(profiles).where(eq(profiles.id, user.id));

  await logAuditEvent({
    userId: user.id,
    action: "deleted_account",
    targetType: "profile",
    targetId: user.id
  });

  const { createSupabaseServerClient } = await import("@/lib/auth/server");
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return { success: true, message: "Account deleted" };
}
