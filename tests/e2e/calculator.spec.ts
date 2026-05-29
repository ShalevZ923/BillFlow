import { expect, test } from "@playwright/test";

test("calculator page has financial tools", async ({ page }) => {
  await page.goto("/calculator");

  await expect(page.getByRole("heading", { name: "Calculator" })).toBeVisible();
  await expect(page.getByText("Monthly to Yearly")).toBeVisible();
  await expect(page.getByText("Yearly to Monthly")).toBeVisible();
  await expect(page.getByText("% Change")).toBeVisible();
});
