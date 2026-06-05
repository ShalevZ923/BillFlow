import { expect, test } from "@playwright/test";

test("shows the BillFlow landing page with signup CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Every bill, under control." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started free" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up" }).first()).toBeVisible();
});
