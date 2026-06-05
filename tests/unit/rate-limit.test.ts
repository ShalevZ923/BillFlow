import { describe, expect, it } from "vitest";
import { rateLimit } from "@/lib/rate-limit";

describe("rate limiter", () => {
  it("allows first request", () => {
    const result = rateLimit("test-user-1");
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(29);
  });

  it("allows requests within limit", () => {
    const key = "test-user-2";
    for (let i = 0; i < 10; i++) {
      const result = rateLimit(key);
      expect(result.allowed).toBe(true);
    }
  });

  it("blocks after exceeding limit", () => {
    const key = "test-user-3";
    for (let i = 0; i < 30; i++) {
      rateLimit(key);
    }
    const result = rateLimit(key);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it("respects custom limits", () => {
    const key = "test-user-4";
    for (let i = 0; i < 5; i++) {
      const result = rateLimit(key, 5);
      expect(result.allowed).toBe(true);
    }
    const result = rateLimit(key, 5);
    expect(result.allowed).toBe(false);
  });

  it("different keys have separate limits", () => {
    for (let i = 0; i < 30; i++) {
      rateLimit("user-a");
    }
    const resultA = rateLimit("user-a");
    const resultB = rateLimit("user-b");

    expect(resultA.allowed).toBe(false);
    expect(resultB.allowed).toBe(true);
  });

  it("returns resetAt in the future", () => {
    const result = rateLimit("test-user-6");
    expect(result.resetAt).toBeGreaterThan(Date.now());
  });
});
