import { expect, test } from "@playwright/test";

test("import/export page shows export and pro-gated import", async ({ page }) => {
  await page.goto("/import-export");

  await expect(page.getByRole("heading", { name: "Import & Export" })).toBeVisible();
  await expect(page.getByText("Export Bills", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export CSV" })).toBeVisible();
  await expect(page.getByText("Import Bills").first()).toBeVisible();
  await expect(page.getByText("Upgrade to Pro").first()).toBeVisible();
});
