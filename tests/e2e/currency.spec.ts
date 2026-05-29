import { expect, test } from "@playwright/test";

test("currency page shows converter and dashboard info", async ({ page }) => {
  await page.goto("/currency");

  await expect(page.getByRole("heading", { name: "Currency" })).toBeVisible();
  await expect(page.getByText("Dashboard Currency")).toBeVisible();
  await expect(page.getByText("Live Currency Converter")).toBeVisible();
  await expect(page.getByText("Pro")).toBeVisible();
});
