import { describe, expect, it, vi } from "vitest";
import BillDetailPage from "@/app/(app)/bills/[id]/page";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  })
}));

vi.mock("@/app/(app)/bills/[id]/actions", () => ({
  getBill: vi.fn()
}));

describe("bill detail route", () => {
  it("redirects direct bill detail requests back to the bills workspace", async () => {
    await expect(
      BillDetailPage({ params: Promise.resolve({ id: "bill-1" }) })
    ).rejects.toThrow("NEXT_REDIRECT");

    expect(redirect).toHaveBeenCalledWith("/bills");
  });
});
