import { expect, test } from "@playwright/test";

test("shows the BillFlow landing page", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Billing follow-up without spreadsheet drift." })).toBeVisible();
  await expect(page.getByRole("link", { name: "Request access" })).toHaveAttribute(
    "href",
    "mailto:hello@billflow.local"
  );
});
