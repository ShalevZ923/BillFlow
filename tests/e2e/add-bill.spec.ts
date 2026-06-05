import { expect, test } from "@playwright/test";

test("can add a bill from the bills page", async ({ page }) => {
  await page.goto("/bills");

  await expect(page.getByRole("heading", { name: "Bills" })).toBeVisible();

  await page.getByText("New Bill").click();
  await page.waitForTimeout(500);

  await expect(page.getByText("Create new bill")).toBeVisible();
  await expect(page.getByPlaceholder("e.g. AWS Invoice")).toBeVisible();
  await expect(page.getByPlaceholder("120.50")).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Bill" })).toBeVisible();
});
