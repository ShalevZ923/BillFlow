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
