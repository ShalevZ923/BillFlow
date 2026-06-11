import { expect, test } from "@playwright/test";

test("login page renders form with email and password", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByText("Log in to BillFlow")).toBeVisible();
  await expect(page.getByText("Your bill command center is waiting")).toBeVisible();
  await expect(page.getByText("Overdue review")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Log in" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign up" }).first()).toBeVisible();
});

test("signup page renders form with email and password", async ({ page }) => {
  await page.goto("/signup");

  await expect(page.getByText("Create your account")).toBeVisible();
  await expect(page.getByText("Start with a cleaner bill workflow")).toBeVisible();
  await expect(page.getByText("Import-ready")).toBeVisible();
  await expect(page.getByLabel("Email")).toBeVisible();
  await expect(page.getByLabel("Password", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Create account" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Log in" }).first()).toBeVisible();
});

test("features page shows all feature cards", async ({ page }) => {
  await page.goto("/features");

  await expect(page.getByText("Everything you need to stay ahead of your bills")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bill Tracking" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Smart Insights" })).toBeVisible();
});

test("pricing page shows Free, Pro, and Business plans", async ({ page }) => {
  await page.goto("/pricing");

  await expect(page.getByRole("heading", { name: "Simple, transparent pricing" })).toBeVisible();
  await expect(page.getByText("Free", { exact: true })).toBeVisible();
  await expect(page.getByText("Pro", { exact: true })).toBeVisible();
  await expect(page.getByText("Business", { exact: true })).toBeVisible();
});
