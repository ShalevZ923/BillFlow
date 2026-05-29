import type { User } from "@supabase/supabase-js";

export type CurrentUser = {
  id: string;
  email: string;
};

export function toCurrentUser(user: User | null): CurrentUser | null {
  if (!user?.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email
  };
}

export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required");
  }

  return { supabaseUrl, supabaseAnonKey };
}
