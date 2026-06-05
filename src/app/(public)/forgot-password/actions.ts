"use server";

import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/auth/server";
import { getEnv } from "@/lib/env";

const forgotPasswordSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format")
});

export type ForgotPasswordState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: string;
};

export async function forgotPasswordAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
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
    const env = getEnv();
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
      redirectTo: `${env.NEXT_PUBLIC_APP_URL}/reset-password`
    });

    if (error) {
      return { error: "Could not send reset email. Please try again." };
    }
  } catch {
    return { error: "Connection error" };
  }

  return { success: "Check your email for a reset link" };
}
