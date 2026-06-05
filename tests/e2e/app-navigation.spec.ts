import { expect, test } from "@playwright/test";

test("app sidebar navigation reaches all sections", async ({ page }) => {
  const pages = [
    { path: "/dashboard", text: "Welcome back" },
    { path: "/bills", heading: "Bills" },
    { path: "/payments", heading: "Payments" },
    { path: "/currency", heading: "Currency Converter" },
    { path: "/calculator", heading: "Financial Calculator" },
    { path: "/import-export", heading: "Import & Export" },
    { path: "/settings", heading: "Settings" }
  ];

  for (const { path, heading, text } of pages) {
    await page.goto(path);
    if (heading) {
      await expect(page.getByRole("heading", { name: heading })).toBeVisible();
    } else if (text) {
      await expect(page.getByText(text)).toBeVisible();
    }
  }
});
