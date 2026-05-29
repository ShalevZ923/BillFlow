import { describe, expect, it } from "vitest";
import { getEnv } from "@/lib/env";

describe("getEnv", () => {
  it("defaults local app url and exchange-rate endpoint", () => {
    const env = getEnv({});

    expect(env.NEXT_PUBLIC_APP_URL).toBe("http://localhost:3000");
    expect(env.EXCHANGE_RATE_API_URL).toBe("https://api.exchangerate.host/latest");
  });

  it("rejects invalid urls", () => {
    expect(() => getEnv({ NEXT_PUBLIC_APP_URL: "not-a-url" })).toThrow();
  });

  it("accepts all optional keys populated", () => {
    const env = getEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-key",
      DATABASE_URL: "postgres://localhost:5432/db",
      STRIPE_SECRET_KEY: "sk_test",
      STRIPE_WEBHOOK_SECRET: "whsec",
      STRIPE_PRO_PRICE_ID: "price_123",
      OPENAI_API_KEY: "sk-openai",
      RESEND_API_KEY: "re_key",
      VAPID_PUBLIC_KEY: "pub",
      VAPID_PRIVATE_KEY: "priv",
      CRON_SECRET: "secret"
    });

    expect(env.DATABASE_URL).toBe("postgres://localhost:5432/db");
  });

  it("rejects invalid exchange rate API URL", () => {
    expect(() => getEnv({ EXCHANGE_RATE_API_URL: "not-a-url" })).toThrow();
  });

  it("defaults REMINDER_FROM_EMAIL", () => {
    const env = getEnv({});
    expect(env.REMINDER_FROM_EMAIL).toBe("BillFlow <reminders@example.com>");
  });
});
