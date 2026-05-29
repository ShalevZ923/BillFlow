import { expect, test } from "@playwright/test";

test("login page renders form with email and password", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Log in to BillFlow" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up" })).toBeVisible();
});

test("signup page renders form with email and password", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" })).toBeVisible();
});

test("features page shows all feature cards", async ({ page }) => {
  await page.goto("/features");

  await expect(page.getByRole("heading", { name: "Everything you need to stay on top of bills" })).toBeVisible();
  await expect(page.getByText("Dashboard command center")).toBeVisible();
  await expect(page.getByText("Recurring bill tracking")).toBeVisible();
});

test("pricing page shows Free, Pro, and Business plans", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByRole("heading", { name: "Simple, transparent pricing" })).toBeVisible();
  await expect(page.getByText("Free")).toHaveCount(2);
  await expect(page.getByText("Pro")).toHaveCount(2);
  await expect(page.getByText("Business")).toHaveCount(2);
});
