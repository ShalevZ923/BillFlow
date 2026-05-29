import { expect, test } from "@playwright/test";

test("dashboard shows obligation overview", async ({ page }) => {
  await page.goto("/dashboard");

  await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
  await expect(page.getByText("Monthly Obligations")).toBeVisible();
  await expect(page.getByText("Yearly Projection")).toBeVisible();
  await expect(page.getByText("Pending")).toBeVisible();
  await expect(page.getByText("Overdue")).toBeVisible();
  await expect(page.getByText("Spending by Category")).toBeVisible();
  await expect(page.getByText("Upcoming 30 Days")).toBeVisible();
  await expect(page.getByText("All Bills")).toBeVisible();
});
