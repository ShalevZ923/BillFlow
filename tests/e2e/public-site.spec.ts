import { expect, test } from "@playwright/test";

test("public site exposes product, pricing, and signup paths", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Billing follow-up without spreadsheet drift." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Pricing" })).toBeVisible();

  await page.getByRole("link", { name: "Pricing" }).click();
  await expect(page.getByText("Free")).toBeVisible();
  await expect(page.getByText("Pro")).toBeVisible();
  await expect(page.getByText("Business")).toBeVisible();

  await page.getByRole("link", { name: "Features" }).click();
  await expect(page.getByRole("heading", { name: "Everything you need to stay on top of bills" })).toBeVisible();
});
