import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";

const PUBLIC_PATHS = [
  "/login", "/signup", "/auth", "/forgot-password",
  "/privacy", "/terms", "/features", "/pricing"
];

const STATIC_PREFIXES = ["/api/", "/_next", "/favicon", "/icon", "/sw.js", "/manifest"];

function isPublicPath(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    STATIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function mapProxyCookieOptions(options: CookieOptions) {
  return {
    domain: options.domain,
    path: options.path ?? "/",
    maxAge: options.maxAge,
    sameSite: (options.sameSite as "lax" | "strict" | "none") ?? "lax",
    secure: options.secure ?? process.env.NODE_ENV === "production",
    httpOnly: options.httpOnly ?? true
  };
}

export async function proxy(request: NextRequest) {
  if (isPublicPath(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, mapProxyCookieOptions(options));
          }
        }
      }
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
