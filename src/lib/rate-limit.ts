const windowMs = 60_000;
const maxRequests = 30;

const store = new Map<string, { count: number; resetAt: number }>();

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key);
    }
  }
}, 60_000).unref();

export function rateLimit(key: string, limit: number = maxRequests, window: number = windowMs): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + window });
    return { allowed: true, remaining: limit - 1, resetAt: now + window };
  }

  if (entry.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { allowed: true, remaining: limit - entry.count, resetAt: entry.resetAt };
}

export function rateLimitRequest(request: Request, limit?: number, window?: number) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "unknown";

  const pathname = new URL(request.url).pathname;
  const key = `${ip}:${pathname}:${request.method}`;

  return rateLimit(key, limit, window);
}
