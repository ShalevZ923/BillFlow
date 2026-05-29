import { expect, test } from "@playwright/test";

test.describe("Dashboard - shadcn/ui redesign", () => {
  test("renders header and tab navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.locator("[data-slot=card]").first()).toBeVisible();
  });

  test("tabs render and are clickable", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("tab", { name: "Overview" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "This Month" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "This Year" })).toBeVisible();
    await page.getByRole("tab", { name: "This Month" }).click();
  });

  test("summary KPI cards render with shadcn Card", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Monthly Obligations")).toBeVisible();
    await expect(page.getByText("Yearly Projection")).toBeVisible();
    const cards = page.locator("[data-slot=card]");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("charts render card titles", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Spending by Category")).toBeVisible();
    await expect(page.getByText("Monthly Cost Breakdown")).toBeVisible();
  });

  test("upcoming list renders with status badges", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Upcoming 30 Days")).toBeVisible();
    const badges = page.locator("[data-slot=badge]");
    await expect(badges.first()).toBeVisible();
  });

  test("AI insights card renders", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("AI Insights")).toBeVisible();
  });

  test("bill list with filters and shadcn Select components renders", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("All Bills")).toBeVisible();

    const searchInputs = page.getByPlaceholder("Search bills...");
    await expect(searchInputs.first()).toBeVisible();

    const selectTriggers = page.locator("[data-slot=select-trigger]");
    expect(await selectTriggers.count()).toBeGreaterThan(0);
  });

  test("shadcn Select triggers are present on dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    const selectTriggers = page.locator("[data-slot=select-trigger]");
    const count = await selectTriggers.count();
    expect(count).toBeGreaterThanOrEqual(5); // status, priority, category, tag, currency
    for (let i = 0; i < count; i++) {
      await expect(selectTriggers.nth(i)).toBeVisible();
    }
  });

  test("dashboard is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
    await expect(page.getByText("Monthly Obligations")).toBeVisible();
  });

  test("shadcn Button components render", async ({ page }) => {
    await page.goto("/pricing");
    const buttons = page.getByRole("button");
    await expect(buttons.first()).toBeVisible();
  });

  test("shadcn Card renders on login page", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByText("Log in to BillFlow")).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.locator("[data-slot=card]")).toBeVisible();
  });

  test("shadcn Card renders on signup page", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByText("Create your account")).toBeVisible();
    await expect(page.locator("[data-slot=card]")).toBeVisible();
    await expect(page.locator("[data-slot=card-footer]")).toBeVisible();
  });

  test("shadcn Badge renders on billing page", async ({ page }) => {
    await page.goto("/settings/billing");
    const badge = page.locator("[data-slot=badge]");
    await expect(badge).toBeVisible();
    await expect(badge).toHaveText("Free");
  });

  test("settings page renders with shadcn Select for currency", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    await expect(page.locator("[data-slot=select-trigger]")).toBeVisible();
  });

  test("onboarding page loads first step", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("What should we call you?")).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
  });
});
