import { expect, test } from "@playwright/test";

test.describe("Dashboard - workflow command center", () => {
  test("renders header and tab navigation", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back")).toBeVisible();
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
    await expect(page.getByText("Due this week")).toBeVisible();
    await expect(page.getByText("Paid MTD")).toBeVisible();
    await expect(page.getByText("Year projection")).toBeVisible();
    const cards = page.locator("[data-slot=card]");
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("charts render card titles", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Spending by Category")).toBeVisible();
    await expect(page.getByText("Monthly Cost Breakdown")).toBeVisible();
  });

  test("due queue renders as the primary workflow module", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Due queue")).toBeVisible();
    await expect(page.getByText(/Overdue, due-today, and upcoming bills/)).toBeVisible();
  });

  test("right rail and secondary modules render", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByText("Next actions")).toBeVisible();
    await expect(page.getByText("Queue health")).toBeVisible();
    await expect(page.getByText("Recent activity")).toBeVisible();
    await expect(page.getByText("Recent bills")).toBeVisible();
  });

  test("dashboard currency selector is present", async ({ page }) => {
    await page.goto("/dashboard");
    const selectTriggers = page.locator("[data-slot=select-trigger]");
    await expect(selectTriggers.first()).toBeVisible();
  });

  test("dashboard is responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/dashboard");
    await expect(page.getByText("Welcome back")).toBeVisible();
    await expect(page.getByText("Due queue")).toBeVisible();
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
    await expect(page.getByText("Default Currency")).toBeVisible();
  });

  test("onboarding page loads first step", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page.getByText("What should we call you?")).toBeVisible();
    await expect(page.getByPlaceholder("Your name")).toBeVisible();
  });
});
