import { expect, test } from "@playwright/test";

test("app sidebar navigation reaches all sections", async ({ page }) => {
  const pages = [
    { path: "/dashboard", heading: "Dashboard" },
    { path: "/bills", heading: "Bills" },
    { path: "/payments", heading: "Payments" },
    { path: "/currency", heading: "Currency" },
    { path: "/calculator", heading: "Calculator" },
    { path: "/import-export", heading: "Import / Export" },
    { path: "/settings", heading: "Settings" }
  ];

  for (const { path, heading } of pages) {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: heading })).toBeVisible();
  }
});
