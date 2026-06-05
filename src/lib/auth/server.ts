import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig, toCurrentUser } from "./session";

function mapSupabaseCookieOptions(options: CookieOptions) {
  return {
    domain: options.domain,
    path: options.path ?? "/",
    maxAge: options.maxAge,
    sameSite: (options.sameSite as "lax" | "strict" | "none") ?? "lax",
    secure: options.secure ?? process.env.NODE_ENV === "production",
    httpOnly: options.httpOnly ?? true
  };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        for (const { name, value, options } of cookiesToSet) {
          try {
            cookieStore.set(name, value, mapSupabaseCookieOptions(options));
          } catch (e) {
            if (process.env.NODE_ENV === "development") {
              console.warn(`[auth] Failed to set cookie "${name}":`, e instanceof Error ? e.message : e);
            }
          }
        }
      }
    }
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  return toCurrentUser(user);
}
