import { expect, test } from "@playwright/test";

test("onboarding walks through steps", async ({ page }) => {
  await page.goto("/onboarding");

  await expect(page.getByText("What should we call you?")).toBeVisible();
  await page.getByPlaceholder("Your name").fill("Alex");
  await page.getByRole("button", { name: "Next" }).first().click();

  await expect(page.getByText("Choose your default currency")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).first().click();

  await expect(page.getByText("Add starter tags")).toBeVisible();
  await page.getByRole("button", { name: "Next" }).first().click();

  await expect(page.getByText("Reminder preferences")).toBeVisible();
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
});
