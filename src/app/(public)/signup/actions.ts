"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { getEnv } from "@/lib/env";
import { rateLimit } from "@/lib/rate-limit";

const signupSchema = z
  .object({
    email: z.string().min(1, "Email is required").email("Invalid email format"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type SignupState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
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

  const emailKey = `signup:${parsed.data.email.toLowerCase().trim()}`;
  const rl = rateLimit(emailKey, 3, 300_000);
  if (!rl.allowed) {
    return { error: "Too many attempts. Please try again later." };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password
    });

    if (error) {
      return { error: "Could not create account. Please try again later." };
    }
  } catch {
    return { error: "Connection error" };
  }

  return { success: "Check your email for a confirmation link" };
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
