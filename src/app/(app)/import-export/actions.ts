"use server";

import { getCurrentUser } from "@/lib/auth/server";
import { createDb } from "@/db/client";
import { bills } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getBillCount(): Promise<number> {
  try {
    const user = await getCurrentUser();
    if (!user) return 0;

    const db = createDb();
    return await db.$count(bills, eq(bills.userId, user.id));
  } catch {
    return 0;
  }
}
