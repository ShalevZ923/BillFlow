import { expect, test } from "@playwright/test";

test("payments page shows history and add form", async ({ page }) => {
  await page.goto("/payments");

  await expect(page.getByRole("heading", { name: "Payments" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Record Payment" })).toBeVisible();

  // Check that mock payment data is displayed
  await expect(page.getByText("Adobe Creative Cloud")).toBeVisible();
  await expect(page.getByText("Internet Provider")).toBeVisible();
});
