import { expect, test } from "@playwright/test";

test("shows the BillFlow landing page with signup CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Billing follow-up without spreadsheet drift." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started free" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
});
