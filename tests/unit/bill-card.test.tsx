import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillCard } from "@/components/bills/bill-card";

describe("BillCard", () => {
  it("opens a quick management dialog instead of linking to a bill page", async () => {
    render(
      <BillCard
        id="bill-1"
        name="AWS Invoice"
        amountCents={12050}
        currency="USD"
        dueDate="2026-06-12"
        category="Cloud"
        priority="critical"
        status="overdue"
        tags={["infra", "cloud"]}
        vendor="Amazon Web Services"
        cycle="monthly"
        notes="Production workloads"
        onChange={vi.fn()}
      />
    );

    expect(screen.queryByRole("link", { name: /aws invoice/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open aws invoice details/i }));

    const dialog = await screen.findByRole("dialog", { name: "AWS Invoice" });
    expect(within(dialog).getByText("Amazon Web Services")).toBeInTheDocument();
    expect(within(dialog).getByText("$120.50")).toBeInTheDocument();
    expect(within(dialog).getByText("Production workloads")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });
});
