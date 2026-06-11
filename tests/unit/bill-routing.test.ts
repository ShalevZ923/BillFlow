import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("bill routing", () => {
  it("does not expose a per-bill detail page route", () => {
    const billDetailPagePath = join(process.cwd(), "src/app/(app)/bills/[id]/page.tsx");

    expect(existsSync(billDetailPagePath)).toBe(false);
  });
});
