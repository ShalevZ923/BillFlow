import { expect, test } from "@playwright/test";

test("settings page has profile, reminders, and billing", async ({ page }) => {
  await page.goto("/settings");

  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(page.getByText("Manage your profile, preferences, and account.")).toBeVisible();
  await expect(page.getByText("Plan & Billing")).toBeVisible();
});

test("settings billing page shows current plan", async ({ page }) => {
  await page.goto("/settings/billing");

  await expect(page.getByRole("heading", { name: "Billing" })).toBeVisible();
  await expect(page.getByText("Current Plan")).toBeVisible();
  await expect(page.getByText("Pro Features")).toBeVisible();
});
