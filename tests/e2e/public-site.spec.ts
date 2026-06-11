import { expect, test } from "@playwright/test";

test("public site exposes product, pricing, and signup paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Bills stop being surprises." })).toBeVisible();
  await expect(page.getByText("Operational bill control")).toBeVisible();
  await expect(page.getByRole("link", { name: "Pricing" }).first()).toBeVisible();

  await page.getByRole("link", { name: "Pricing" }).first().click();
  await expect(page.getByRole("heading", { name: "Simple, transparent pricing" })).toBeVisible();
  await expect(page.getByText("Business", { exact: true })).toBeVisible();

  await page.getByRole("link", { name: "Features" }).first().click();
  await expect(page.getByText("Everything you need to stay ahead of your bills")).toBeVisible();
});
