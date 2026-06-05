"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { getEnv } from "@/lib/env";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters")
});

export type LoginState = {
  success?: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as string;
      if (!fieldErrors[field]) {
        fieldErrors[field] = issue.message;
      }
    }
    return { fieldErrors };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(parsed.data);

    if (error) {
      return { error: "Invalid email or password" };
    }

    return { success: true };
  } catch {
    return { error: "Connection error" };
  }
}

export async function googleLoginAction(): Promise<{ url?: string; error?: string }> {
  try {
    const env = getEnv();
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${env.NEXT_PUBLIC_APP_URL}/auth/callback`
      }
    });

    if (error || !data.url) {
      return { error: "Could not connect to Google" };
    }

    return { url: data.url };
  } catch {
    return { error: "Connection error" };
  }
}
