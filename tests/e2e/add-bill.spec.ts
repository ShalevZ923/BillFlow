import { expect, test } from "@playwright/test";

test("can add a bill from the bills page", async ({ page }) => {
  await page.goto("/bills");

  await expect(page.getByRole("heading", { name: "Bills" })).toBeVisible();

  await page.getByRole("button", { name: "Add Bill" }).click();

  await page.getByLabel("Bill name").fill("Test Bill");
  await page.getByLabel("Amount").fill("99.99");
  await page.getByLabel("Due date").fill("2026-12-31");
  await page.getByLabel("Category").fill("Test");

  await page.getByRole("button", { name: "Add Bill", exact: true }).click();

  await expect(page.getByText("Test Bill")).toBeVisible();
});
