import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "@/components/layout/notification-center";
import { getNotifications } from "@/app/(app)/actions";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push })
}));

vi.mock("@/app/(app)/actions", () => ({
  getNotifications: vi.fn()
}));

describe("NotificationCenter", () => {
  beforeEach(() => {
    push.mockClear();
    vi.mocked(getNotifications).mockResolvedValue([
      {
        id: "upcoming-occ-1",
        type: "upcoming",
        message: "AWS Invoice is due soon",
        billId: "bill-1",
        timestamp: "2026-06-12"
      }
    ]);
    localStorage.clear();
  });

  it("routes notification clicks to the bills workspace instead of a per-bill page", async () => {
    render(<NotificationCenter />);

    fireEvent.click(screen.getByRole("button", { name: "Notifications" }));

    const notification = await screen.findByRole("button", { name: /aws invoice is due soon/i });
    fireEvent.click(notification);

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith("/bills?bill=bill-1");
    });
    expect(push).not.toHaveBeenCalledWith("/bills/bill-1");
  });
});
