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

  it("treats blank optional strings as absent", () => {
    const env = getEnv({ NEXT_PUBLIC_SUPABASE_URL: "", DATABASE_URL: "" });

    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBeUndefined();
    expect(env.DATABASE_URL).toBeUndefined();
  });
});
