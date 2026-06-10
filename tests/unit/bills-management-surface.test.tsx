import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { BillsManagementSurface } from "@/components/bills/bills-management-surface";
import type { BillData } from "@/app/(app)/bills/actions";

const bills: BillData[] = [
  {
    id: "bill-1",
    name: "AWS Invoice",
    vendor: "Amazon Web Services",
    amountCents: 12050,
    currency: "USD",
    dueDate: "2026-06-12",
    cycle: "monthly",
    category: "Cloud",
    priority: "critical",
    status: "overdue",
    tags: ["infra", "cloud"],
    notes: "Production workloads"
  },
  {
    id: "bill-2",
    name: "Figma",
    vendor: "Figma Inc.",
    amountCents: 4500,
    currency: "USD",
    dueDate: "2026-06-20",
    cycle: "monthly",
    category: "Design",
    priority: "medium",
    status: "unpaid",
    tags: ["design"],
    notes: ""
  }
];

describe("BillsManagementSurface", () => {
  it("opens bill details in a dialog from a management row instead of linking to a detail page", async () => {
    render(
      <BillsManagementSurface
        bills={bills}
        onBillCreated={vi.fn()}
        onBillsChanged={vi.fn()}
      />
    );

    const awsRow = screen.getByRole("button", { name: /open AWS Invoice details/i });
    expect(within(awsRow).queryByRole("link")).not.toBeInTheDocument();

    fireEvent.click(awsRow);

    const dialog = await screen.findByRole("dialog", { name: "AWS Invoice" });
    expect(within(dialog).getByText("Amazon Web Services")).toBeInTheDocument();
    expect(within(dialog).getByText("$120.50")).toBeInTheDocument();
    expect(within(dialog).getByText("Production workloads")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });
});
