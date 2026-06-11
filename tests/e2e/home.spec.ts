import { expect, test } from "@playwright/test";

test("shows the BillFlow landing page with signup CTA", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Bills stop being surprises." })).toBeVisible();
  await expect(page.getByText("Due queue", { exact: true })).toBeVisible();
  await expect(page.getByText("Paid MTD", { exact: true })).toBeVisible();
  await expect(page.getByText("Next actions", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: "Get started free" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up" }).first()).toBeVisible();
});
