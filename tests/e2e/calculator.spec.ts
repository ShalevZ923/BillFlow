import { expect, test } from "@playwright/test";

test("calculator page has financial tools", async ({ page }) => {
  await page.goto("/calculator");

  await expect(page.getByRole("heading", { name: "Financial Calculator" })).toBeVisible();
  await expect(page.getByText("Monthly → Yearly Projection")).toBeVisible();
  await expect(page.getByText("Yearly → Monthly Breakdown")).toBeVisible();

  await page.getByRole("button", { name: "Advanced" }).click();
  await page.waitForTimeout(500);
  await expect(page.getByText("Percentage Change")).toBeVisible();
  await expect(page.getByText("Subscription Annual Cost")).toBeVisible();
});
