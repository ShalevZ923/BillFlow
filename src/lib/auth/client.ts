"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig, toCurrentUser } from "./session";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

export async function getCurrentUser() {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return toCurrentUser(user);
}
