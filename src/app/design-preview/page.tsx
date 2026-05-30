"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CreditCard,
  DollarSign,
  Download,
  FileText,
  Inbox,
  LayoutDashboard,
  Lightbulb,
  Plus,
  Search,
  TrendingUp,
  Upload,
  X,
  ShieldCheck,
  Zap,
  Users,
  BarChart3,
  Calculator,
  Calendar,
  Clock,
  AlertTriangle,
  Globe,
  Mail,
  Star,
  Moon,
  Sun,
  ChevronLeft,
  Settings
} from "lucide-react";
import {
  mockBills,
  mockUpcomingItems,
  mockCategoryTotals,
  mockMonthlyBreakdown,
  mockDashboardSummary,
  mockPricingPlans,
  mockActivityFeed,
  mockFeaturedFeatures,
  mockIntakeSources,
  mockDetectedBills,
  mockUserProfile,
  type MockBill,
  type MockUpcomingItem
} from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function getCurrencySymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(cents: number, code: string): string {
  return `${getCurrencySymbol(code)}${formatCents(cents)}`;
}

const sections = [
  { id: "public", label: "Public Website" },
  { id: "dashboard", label: "Dashboard" },
  { id: "bills", label: "Bills Page" },
  { id: "modal", label: "Add Bill Modal" },
  { id: "intake", label: "Intake Center" },
  { id: "currency", label: "Currency & Calculator" },
  { id: "settings", label: "Settings" }
];

export default function DesignPreview() {
  const [activeSection, setActiveSection] = useState("public");
  const [showModal, setShowModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Design Preview Banner */}
      <div className="sticky top-0 z-50 border-b border-border bg-amber-50 px-4 py-2 text-center text-sm font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-200">
        Design Preview / Wireframe — Not the real app.{" "}
        <span className="text-muted-foreground">
          Scroll to review the proposed visual direction.
        </span>
      </div>

      {/* Section Nav */}
      <div className="border-b border-border bg-white dark:bg-card">
        <div className="mx-auto flex max-w-6xl items-center gap-1 overflow-x-auto px-5 py-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium transition ${
                activeSection === s.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* PUBLIC WEBSITE */}
      {/* ================================================================ */}
      {activeSection === "public" && (
        <div>
          {/* Header */}
          <header className="border-b border-border bg-white dark:bg-card">
            <div className="mx-auto flex min-h-[72px] w-full max-w-6xl items-center justify-between px-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  BF
                </div>
                <div>
                  <span className="font-semibold">BillFlow</span>
                  <span className="ml-1.5 text-xs text-muted-foreground">by SeeHy</span>
                </div>
              </div>
              <nav className="hidden gap-8 md:flex">
                {["Features", "Intake", "Pricing"].map((item) => (
                  <button key={item} className="text-sm text-muted-foreground transition hover:text-foreground">
                    {item}
                  </button>
                ))}
              </nav>
              <div className="flex items-center gap-3">
                <button className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
                  Log in
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary/90">
                  Sign up free
                </button>
              </div>
            </div>
          </header>

          {/* Hero */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
            <div className="relative mx-auto max-w-6xl px-5 pb-20 pt-20 lg:pt-28">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium dark:bg-card">
                    <Zap size={12} className="text-primary" />
                    Made by SeeHy Labs
                  </div>
                  <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                    Every bill,{" "}
                    <span className="text-primary">under control.</span>
                  </h1>
                  <p className="mt-5 max-w-lg text-lg leading-8 text-muted-foreground">
                    BillFlow by SeeHy helps you track every payment, due date, and
                    financial obligation in one clean dashboard. Never miss a bill
                    again.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    <button className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90">
                      Get started free
                      <ArrowRight size={16} />
                    </button>
                    <button className="rounded-xl border border-border bg-white px-6 py-3 text-sm font-medium transition hover:bg-muted dark:bg-card">
                      See how it works
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">
                    Free plan available — no credit card required
                  </p>
                </div>

                {/* Dashboard Preview Card */}
                <div className="rounded-2xl border border-border bg-white p-5 shadow-lg dark:bg-card">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Dashboard Preview
                      </p>
                      <p className="mt-1 text-2xl font-bold">{formatCurrency(mockDashboardSummary.monthlyObligationsCents, "USD")}</p>
                      <p className="text-xs text-muted-foreground">monthly obligations</p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
                        {mockDashboardSummary.overdueCount} overdue
                      </span>
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                        {mockDashboardSummary.pendingCount} upcoming
                      </span>
                    </div>
                  </div>

                  {/* Mini Bill List */}
                  <div className="space-y-2">
                    {mockUpcomingItems.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 dark:bg-muted/30"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{item.name}</p>
                          <p className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar size={10} />
                            {item.daysUntilDue}d left
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold">
                            {formatCurrency(item.amountCents, item.currency)}
                          </p>
                          {item.priority === "critical" && (
                            <span className="text-xs font-medium text-destructive">Critical</span>
                          )}
                          {item.priority === "high" && (
                            <span className="text-xs font-medium text-yellow-600">High</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Mini Chart */}
                  <div className="mt-4 flex items-end gap-1 h-16">
                    {mockMonthlyBreakdown.map((m) => {
                      const max = Math.max(...mockMonthlyBreakdown.map((x) => x.amountCents));
                      const pct = (m.amountCents / max) * 100;
                      return (
                        <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t-sm bg-primary/60"
                            style={{ height: `${pct}%` }}
                          />
                          <span className="text-[10px] text-muted-foreground">
                            {m.month.slice(5)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Bar */}
          <section className="border-y border-border bg-white dark:bg-card">
            <div className="mx-auto flex max-w-4xl divide-x divide-border">
              {[
                { value: "2,400+", label: "businesses use BillFlow" },
                { value: "85,000+", label: "bills tracked monthly" },
                { value: "99.8%", label: "platform uptime" }
              ].map((stat, i) => (
                <div key={i} className="flex-1 px-6 py-8 text-center">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features Grid */}
          <section className="mx-auto max-w-6xl px-5 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
                Features
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Everything you need to stay ahead of your bills
              </h2>
              <p className="mt-3 text-muted-foreground">
                From simple tracking to AI-powered insights — BillFlow grows
                with your needs.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mockFeaturedFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border bg-white p-6 transition hover:border-primary/30 hover:shadow-sm dark:bg-card"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {feature.icon === "FileText" && <FileText size={20} />}
                    {feature.icon === "Lightbulb" && <Lightbulb size={20} />}
                    {feature.icon === "DollarSign" && <DollarSign size={20} />}
                    {feature.icon === "Calculator" && <Calculator size={20} />}
                    {feature.icon === "Upload" && <Upload size={20} />}
                    {feature.icon === "Inbox" && <Inbox size={20} />}
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Omnichannel Intake Teaser */}
          <section className="border-y border-border bg-white py-20 dark:bg-card">
            <div className="mx-auto max-w-6xl px-5">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
                    Omnichannel Intake
                  </p>
                  <h2 className="mt-2 text-3xl font-bold tracking-tight">
                    Bills arrive from everywhere. We handle it.
                  </h2>
                  <p className="mt-4 leading-relaxed text-muted-foreground">
                    BillFlow&apos;s intake engine can collect bills from Gmail,
                    Google Sheets, CSV files, Excel spreadsheets, PDF invoices,
                    and soon — direct invoicing system integrations.
                  </p>
                  <ul className="mt-6 space-y-3">
                    {["Gmail bill detection", "Google Sheets sync", "CSV / Excel import", "PDF invoice scanning", "Invoicing platform (coming soon)"].map((item) => (
                      <li key={item} className="flex items-center gap-3 text-sm">
                        <Check size={16} className="shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <button className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80">
                    Learn about intake
                    <ChevronRight size={16} />
                  </button>
                </div>
                <div className="rounded-2xl border border-border bg-background p-6 dark:bg-muted/20">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-4">
                    Connected Sources
                  </p>
                  <div className="space-y-3">
                    {mockIntakeSources.map((src) => (
                      <div
                        key={src.id}
                        className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 dark:bg-card"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Mail size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{src.name}</p>
                          <p className="text-xs text-muted-foreground">{src.description}</p>
                        </div>
                        {src.comingSoon ? (
                          <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                            Coming soon
                          </span>
                        ) : (
                          <button className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition hover:bg-muted">
                            Connect
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="mx-auto max-w-6xl px-5 py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-medium uppercase tracking-[0.14em] text-primary">
                Pricing
              </p>
              <h2 className="mt-2 text-3xl font-bold tracking-tight">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-muted-foreground">
                Start free, upgrade when you need more power.
              </p>
            </div>
            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {mockPricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-6 ${
                    plan.popular
                      ? "border-primary bg-primary/5 shadow-lg ring-1 ring-primary dark:bg-primary/10"
                      : "border-border bg-white dark:bg-card"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      Most popular
                    </div>
                  )}
                  {plan.comingSoon && (
                    <div className="absolute -top-3 right-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                      Coming soon
                    </div>
                  )}
                  <div className="mb-4">
                    <p className="text-lg font-bold">{plan.name}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 border-t border-border pt-5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2.5 text-sm">
                        <Check size={14} className="shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <button
                    className={`mt-6 w-full rounded-xl py-2.5 text-sm font-semibold transition ${
                      plan.popular
                        ? "bg-primary text-white hover:bg-primary/90"
                        : plan.comingSoon
                          ? "cursor-not-allowed border border-border bg-muted text-muted-foreground"
                          : "border border-border bg-white hover:bg-muted dark:bg-card"
                    }`}
                    disabled={plan.comingSoon}
                  >
                    {plan.comingSoon ? "Coming soon" : plan.cta}
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Final CTA */}
          <section className="border-y border-border bg-primary py-20">
            <div className="mx-auto max-w-2xl px-5 text-center">
              <h2 className="text-3xl font-bold text-white">
                Ready to take control of your bills?
              </h2>
              <p className="mt-4 text-primary-foreground/80">
                Join thousands of businesses and freelancers who trust BillFlow by
                SeeHy to manage their financial obligations.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <button className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary transition hover:bg-white/90">
                  Get started free
                  <ArrowRight size={16} />
                </button>
                <p className="text-sm text-primary-foreground/60">
                  No credit card required
                </p>
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="border-t border-border bg-white py-12 dark:bg-card">
            <div className="mx-auto max-w-6xl px-5">
              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-white">
                      BF
                    </div>
                    <span className="font-semibold">BillFlow</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Smart bill management by SeeHy Labs.
                  </p>
                </div>
                {[
                  {
                    title: "Product",
                    links: ["Features", "Pricing", "Changelog", "API"]
                  },
                  {
                    title: "Resources",
                    links: ["Documentation", "Guides", "Blog", "Support"]
                  },
                  {
                    title: "Company",
                    links: ["About", "Privacy", "Terms", "Contact"]
                  }
                ].map((group) => (
                  <div key={group.title}>
                    <p className="text-sm font-semibold">{group.title}</p>
                    <ul className="mt-3 space-y-2">
                      {group.links.map((link) => (
                        <li key={link}>
                          <span className="text-sm text-muted-foreground transition hover:text-foreground cursor-pointer">
                            {link}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="mt-10 border-t border-border pt-6 text-center">
                <p className="text-xs text-muted-foreground">
                  &copy; {new Date().getFullYear()} SeeHy Labs. All rights
                  reserved. BillFlow is a product of SeeHy Labs.
                </p>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* ================================================================ */}
      {/* DASHBOARD */}
      {/* ================================================================ */}
      {activeSection === "dashboard" && (
        <div className="flex min-h-[calc(100vh-120px)]">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 border-r border-border bg-white dark:bg-card lg:flex lg:flex-col">
            <div className="flex h-[60px] items-center gap-2 border-b border-border px-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-white">
                BF
              </div>
              <span className="text-sm font-semibold">BillFlow</span>
              <span className="text-[10px] text-muted-foreground">by SeeHy</span>
            </div>
            <nav className="flex flex-1 flex-col gap-0.5 p-2">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true, count: 2 },
                { icon: FileText, label: "Bills", count: 3 },
                { icon: CreditCard, label: "Payments" },
                { icon: Globe, label: "Currency" },
                { icon: Calculator, label: "Calculator" },
                { icon: Upload, label: "Import/Export" },
                { icon: Inbox, label: "Intake Center" },
                { icon: Settings, label: "Settings" }
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition cursor-pointer ${
                    item.active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <item.icon size={17} className="shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.count && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold text-white">
                      {item.count}
                    </span>
                  )}
                </div>
              ))}
            </nav>
            <div className="border-t border-border p-3">
              <div className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted hover:text-foreground">
                <Moon size={17} />
                <span>Dark Mode</span>
              </div>
              <div className="mt-2 flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground cursor-pointer hover:bg-muted">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  AM
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-foreground">
                    {mockUserProfile.name}
                  </p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {mockUserProfile.email}
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1 overflow-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back, {mockUserProfile.name.split(" ")[0]}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {new Date().toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                    <Plus size={16} />
                    Add Bill
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted dark:bg-card">
                    <Upload size={16} />
                    Import
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <DollarSign size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Monthly Obligations</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(mockDashboardSummary.monthlyObligationsCents, "USD")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <TrendingUp size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Yearly Projection</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(mockDashboardSummary.yearlyProjectionCents, "USD")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-white p-4 shadow-sm dark:bg-card">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                      <Clock size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Due Soon</p>
                      <p className="text-xl font-bold">
                        {mockDashboardSummary.pendingCount} bills
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatCurrency(mockDashboardSummary.pendingAmountCents, "USD")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 shadow-sm dark:bg-destructive/10">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                      <AlertTriangle size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-destructive/80">Overdue</p>
                      <p className="text-xl font-bold text-destructive">
                        {mockDashboardSummary.overdueCount} bill
                      </p>
                      <p className="text-xs text-destructive/70">
                        {formatCurrency(mockDashboardSummary.overdueAmountCents, "USD")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Charts + Upcoming */}
              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                {/* Charts Column */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <h3 className="text-sm font-semibold mb-4">Monthly Spending</h3>
                    <div className="flex items-end gap-2 h-40">
                      {mockMonthlyBreakdown.map((m, i) => {
                        const max = Math.max(...mockMonthlyBreakdown.map((x) => x.amountCents));
                        const pct = (m.amountCents / max) * 100;
                        return (
                          <div key={m.month} className="flex flex-1 flex-col items-center gap-1.5">
                            <div
                              className="w-full rounded-t-md bg-primary/70 hover:bg-primary transition-colors"
                              style={{ height: `${pct}%` }}
                            />
                            <span className="text-[11px] text-muted-foreground">
                              {["Jan","Feb","Mar","Apr","May","Jun","Jul"][i]}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-primary/70" /> 2026
                      </span>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <h3 className="text-sm font-semibold mb-4">Category Breakdown</h3>
                    <div className="space-y-3">
                      {mockCategoryTotals.map((cat) => {
                        const total = mockCategoryTotals.reduce((s, c) => s + c.amountCents, 0);
                        const pct = Math.round((cat.amountCents / total) * 100);
                        return (
                          <div key={cat.category} className="flex items-center gap-3">
                            <div
                              className="h-3 w-3 shrink-0 rounded-sm"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="w-20 text-sm">{cat.category}</span>
                            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{
                                  width: `${pct}%`,
                                  backgroundColor: cat.color
                                }}
                              />
                            </div>
                            <span className="w-16 text-right text-sm font-medium">
                              {formatCurrency(cat.amountCents, "USD")}
                            </span>
                            <span className="w-10 text-right text-xs text-muted-foreground">
                              {pct}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Upcoming + Quick Actions */}
                <div className="space-y-6">
                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold">Upcoming Bills</h3>
                      <span className="text-xs font-medium text-primary">
                        Next 30 days
                      </span>
                    </div>
                    <div className="space-y-3">
                      {mockUpcomingItems.map((item) => (
                        <div
                          key={item.id}
                          className={`rounded-lg border p-3 ${
                            item.priority === "critical"
                              ? "border-destructive/30 bg-destructive/5"
                              : "border-border bg-background dark:bg-muted/20"
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.vendor}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <p className="text-sm font-semibold">
                                {formatCurrency(item.amountCents, item.currency)}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar size={10} />
                              {item.daysUntilDue}d until due
                            </span>
                            {item.priority === "critical" && (
                              <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold text-destructive">
                                Critical
                              </span>
                            )}
                            {item.priority === "high" && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                High
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                    <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { icon: Plus, label: "Add Bill" },
                        { icon: Upload, label: "Import" },
                        { icon: Globe, label: "Convert" },
                        { icon: Calculator, label: "Calculate" }
                      ].map((action) => (
                        <button
                          key={action.label}
                          className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background p-3 text-xs font-medium transition hover:bg-muted hover:border-primary/30 dark:bg-muted/20"
                        >
                          <action.icon size={16} className="text-primary" />
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
                <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
                <div className="space-y-2">
                  {mockActivityFeed.map((act) => (
                    <div
                      key={act.id}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm hover:bg-muted/50"
                    >
                      <div
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                          act.action === "paid"
                            ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                            : act.action === "overdue"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-primary/10 text-primary"
                        }`}
                      >
                        {act.action === "paid" && <Check size={14} />}
                        {act.action === "added" && <Plus size={14} />}
                        {act.action === "imported" && <Upload size={14} />}
                        {act.action === "overdue" && <AlertTriangle size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{act.billName}</span>
                        <span className="text-muted-foreground">
                          {" "}
                          was {act.action}
                          {act.amountCents > 0 && ` — ${formatCurrency(act.amountCents, act.currency)}`}
                        </span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{act.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* BILLS PAGE */}
      {/* ================================================================ */}
      {activeSection === "bills" && (
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {mockBills.length} bills total —{" "}
                <span className="text-destructive font-medium">
                  {mockBills.filter((b) => b.status === "overdue").length} overdue
                </span>
                ,{" "}
                <span className="text-primary font-medium">
                  {mockBills.filter((b) => b.status === "unpaid").length} unpaid
                </span>
              </p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
              <Plus size={16} />
              Add Bill
            </button>
          </div>

          {/* Search + Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search bills..."
                className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
              />
            </div>
            {["All", "Unpaid", "Overdue", "Paid"].map((tab) => (
              <button
                key={tab}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  tab === "All"
                    ? "bg-primary text-white"
                    : "border border-border bg-white text-muted-foreground hover:bg-muted dark:bg-card"
                }`}
              >
                {tab}
              </button>
            ))}
            <select className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none dark:bg-card">
              <option>All Categories</option>
              <option>Rent</option>
              <option>SaaS</option>
              <option>Cloud</option>
              <option>Utilities</option>
            </select>
            <select className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none dark:bg-card">
              <option>All Priorities</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          {/* Bill Cards Grid */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {mockBills.map((bill) => (
              <BillPreviewCard key={bill.id} bill={bill} />
            ))}
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* ADD BILL MODAL */}
      {/* ================================================================ */}
      {activeSection === "modal" && (
        <div className="relative min-h-[calc(100vh-120px)]">
          {/* Background page content */}
          <div className="mx-auto max-w-6xl px-5 py-10 opacity-40 pointer-events-none">
            <h1 className="text-2xl font-bold mb-4">Bills Page (Background)</h1>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {mockBills.slice(0, 3).map((bill) => (
                <BillPreviewCard key={bill.id} bill={bill} />
              ))}
            </div>
          </div>

          {/* Modal Overlay */}
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm pt-[10vh]">
            <div className="w-full max-w-lg rounded-2xl border border-border bg-white shadow-2xl dark:bg-card animate-in fade-in-0 zoom-in-95">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-border px-6 py-4">
                <div>
                  <h2 className="text-lg font-bold">Add New Bill</h2>
                  <p className="text-sm text-muted-foreground">
                    Enter the bill details below.
                  </p>
                </div>
                <button className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground">
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Bill Name</label>
                    <input
                      placeholder="e.g. AWS Cloud Infrastructure"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium mb-1.5">Vendor</label>
                    <input
                      placeholder="e.g. Amazon Web Services"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-sm font-medium mb-1.5">Amount</label>
                    <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <select className="border-r border-border bg-muted px-2 py-2 text-sm outline-none dark:bg-muted/50">
                        <option>USD</option>
                        <option>EUR</option>
                        <option>GBP</option>
                        <option>ILS</option>
                      </select>
                      <input
                        placeholder="0.00"
                        className="flex-1 bg-background px-3 py-2 text-sm outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Due Date</label>
                    <input
                      type="date"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Billing Cycle</label>
                    <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                      <option>Monthly</option>
                      <option>Yearly</option>
                      <option>One-time</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Category</label>
                    <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                      <option>SaaS</option>
                      <option>Cloud</option>
                      <option>Rent</option>
                      <option>Utilities</option>
                      <option>Insurance</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Priority</label>
                    <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                      <option>Medium</option>
                      <option>Critical</option>
                      <option>High</option>
                      <option>Low</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Tags</label>
                    <input
                      placeholder="e.g. cloud, infrastructure"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1.5">Notes</label>
                    <textarea
                      placeholder="Any additional notes..."
                      rows={3}
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 border-t border-border px-6 py-4">
                <button className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-muted dark:bg-card">
                  Cancel
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Save Bill
                </button>
              </div>
            </div>
          </div>

          <div className="text-center py-8">
            <button
              onClick={() => setShowModal(!showModal)}
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white"
            >
              {showModal ? "Hide Modal" : "Show Modal Demo"}
            </button>
            <p className="mt-3 text-sm text-muted-foreground">
              The modal is shown above with a blurred backdrop. Click to
              demonstrate the pop-up behavior.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* INTAKE CENTER */}
      {/* ================================================================ */}
      {activeSection === "intake" && (
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Intake Center</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect your bill sources and manage detected bills in one place.
            </p>
          </div>

          {/* Source Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            {mockIntakeSources.map((src) => (
              <div
                key={src.id}
                className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{src.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {src.connected ? `${src.billsFound} bills found` : "Not connected"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mb-4">
                  {src.description}
                </p>
                {src.comingSoon ? (
                  <span className="inline-block rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                    Coming soon
                  </span>
                ) : (
                  <button className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted transition">
                    <Plus size={12} />
                    Connect
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Detected Bills */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
            <h3 className="text-sm font-semibold mb-4">Detected Bills Queue</h3>
            <div className="space-y-2">
              {mockDetectedBills.map((det) => (
                <div
                  key={det.id}
                  className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-4 dark:bg-muted/20"
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      {det.source}
                    </span>
                    <span className="text-sm font-medium truncate">{det.vendor}</span>
                    <span className="text-sm font-semibold">
                      {formatCurrency(det.amountCents, det.currency)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Due {det.dueDate}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        det.confidence >= 0.9
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                          : det.confidence >= 0.8
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                            : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {Math.round(det.confidence * 100)}% match
                    </span>
                    {det.duplicateWarning && (
                      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                        Possible duplicate
                      </span>
                    )}
                    <button className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-primary/90">
                      Approve
                    </button>
                    <button className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                      Edit
                    </button>
                    <button className="shrink-0 rounded-lg px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground">
                      <X size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center">
              * These are mock detected bills. Real intake requires connected
              sources.
            </p>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* CURRENCY & CALCULATOR */}
      {/* ================================================================ */}
      {activeSection === "currency" && (
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Currency Converter */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  Currency Converter
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Convert between supported currencies with live exchange rates.
                </p>
              </div>
              <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold">Quick Convert</span>
                  <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Demo Rates
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Amount</label>
                    <input
                      type="number"
                      defaultValue="100"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">From</label>
                      <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                        <option>USD — US Dollar</option>
                        <option>EUR — Euro</option>
                        <option>GBP — British Pound</option>
                        <option>ILS — Israeli Shekel</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">To</label>
                      <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                        <option>EUR — Euro</option>
                        <option>USD — US Dollar</option>
                        <option>GBP — British Pound</option>
                        <option>ILS — Israeli Shekel</option>
                      </select>
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-background p-4 text-center dark:bg-muted/20">
                    <p className="text-xs text-muted-foreground">Converted Amount</p>
                    <p className="mt-1 text-2xl font-bold text-primary">€92.00</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      1 USD = 0.92 EUR
                    </p>
                  </div>

                  <div className="flex gap-2">
                    {[
                      { label: "USD → EUR", rate: "0.92" },
                      { label: "USD → GBP", rate: "0.79" },
                      { label: "USD → ILS", rate: "3.65" },
                      { label: "EUR → USD", rate: "1.09" }
                    ].map((r) => (
                      <button
                        key={r.label}
                        className="flex-1 rounded-lg border border-border bg-white px-2 py-2 text-center text-xs hover:bg-muted dark:bg-card"
                      >
                        <p className="font-medium">{r.label}</p>
                        <p className="text-muted-foreground">{r.rate}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Calculator */}
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold tracking-tight">
                  Financial Calculator
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  Simple and advanced financial calculations.
                </p>
              </div>

              <div className="space-y-6">
                {/* Mode Selector */}
                <div className="flex rounded-lg border border-border bg-muted p-1 dark:bg-muted/50">
                  {["Simple", "Advanced"].map((mode) => (
                    <button
                      key={mode}
                      className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition ${
                        mode === "Simple"
                          ? "bg-white shadow-sm dark:bg-card"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
                  <h3 className="text-sm font-semibold mb-4">
                    Monthly → Yearly Projection
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">
                        Monthly Amount
                      </label>
                      <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                        <select className="border-r border-border bg-muted px-2 py-2 text-sm outline-none">
                          <option>USD</option>
                        </select>
                        <input
                          defaultValue="2,500"
                          className="flex-1 bg-background px-3 py-2 text-sm outline-none"
                        />
                      </div>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-4 text-center">
                      <p className="text-xs text-muted-foreground">Yearly Total</p>
                      <p className="text-2xl font-bold text-primary">$30,000.00</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
                  <h3 className="text-sm font-semibold mb-4">
                    Percentage Change
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Old Value</label>
                      <input
                        defaultValue="1,000"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New Value</label>
                      <input
                        defaultValue="1,200"
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                  <div className="mt-3 rounded-lg bg-green-50 p-4 text-center dark:bg-green-900/20">
                    <p className="text-xs text-muted-foreground">Change</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      +20.00%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* SETTINGS */}
      {/* ================================================================ */}
      {activeSection === "settings" && (
        <div className="mx-auto max-w-3xl px-5 py-10">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage your profile, preferences, and account.
            </p>
          </div>

          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="text-sm font-semibold mb-4">Profile</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Name</label>
                  <input
                    defaultValue={mockUserProfile.name}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email</label>
                  <input
                    defaultValue={mockUserProfile.email}
                    disabled
                    className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">
                    Default Currency
                  </label>
                  <select className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary">
                    <option>USD — US Dollar</option>
                    <option>EUR — Euro</option>
                    <option>GBP — British Pound</option>
                    <option>ILS — Israeli Shekel</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="text-sm font-semibold mb-4">Notifications</h3>
              <div className="space-y-3">
                {[
                  { label: "Email reminders (7 days before)", checked: true },
                  { label: "Email reminders (1 day before)", checked: true },
                  { label: "Email reminders (on overdue)", checked: true },
                  { label: "Browser push notifications", checked: false }
                ].map((item) => (
                  <label
                    key={item.label}
                    className="flex items-center justify-between py-2 cursor-pointer"
                  >
                    <span className="text-sm">{item.label}</span>
                    <div
                      className={`h-5 w-9 rounded-full transition-colors ${
                        item.checked ? "bg-primary" : "bg-border"
                      }`}
                    >
                      <div
                        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                          item.checked ? "translate-x-[18px]" : "translate-x-[2px]"
                        }`}
                      />
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="text-sm font-semibold mb-4">Plan & Billing</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Current Plan</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
                      Free
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Up to 25 bills, basic features.
                  </p>
                </div>
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90">
                  Upgrade to Pro
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="text-sm font-semibold mb-4">Team Settings</h3>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Team Access</span>
                    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                      Business
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upgrade to Business for team collaboration.
                  </p>
                </div>
                <button disabled className="cursor-not-allowed rounded-lg border border-border bg-muted px-4 py-2 text-sm font-medium text-muted-foreground">
                  Locked
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-white p-6 shadow-sm dark:bg-card">
              <h3 className="text-sm font-semibold mb-4">Connected Sources</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Manage your connected bill intake sources.
              </p>
              {mockIntakeSources.slice(0, 3).map((src) => (
                <div
                  key={src.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Mail size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{src.name}</p>
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted">
                    Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- */
/* Bill Preview Card (used in Bills page) */
/* ---------------------------------- */
function BillPreviewCard({ bill }: { bill: MockBill }) {
  const statusStyles: Record<string, string> = {
    unpaid: "bg-muted text-muted-foreground",
    paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    overdue: "bg-destructive/10 text-destructive",
    skipped: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
  };

  const priorityStyles: Record<string, string> = {
    low: "text-muted-foreground",
    medium: "text-muted-foreground",
    high: "text-amber-600 dark:text-amber-400",
    critical: "text-destructive"
  };

  return (
    <div
      className={`rounded-xl border bg-white p-4 transition hover:shadow-sm dark:bg-card ${
        bill.status === "overdue" ? "border-destructive/30 bg-destructive/5" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold truncate">{bill.name}</h3>
            {bill.priority === "critical" && (
              <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                !
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{bill.vendor}</p>
        </div>
        <span className="text-sm font-bold whitespace-nowrap">
          {formatCurrency(bill.amountCents, bill.currency)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyles[bill.status]}`}
        >
          {bill.status}
        </span>
        <span className={`text-[10px] font-medium capitalize ${priorityStyles[bill.priority]}`}>
          {bill.priority}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Calendar size={10} />
          {bill.dueDate}
        </span>
        {bill.source && (
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
            via {bill.source}
          </span>
        )}
      </div>
      {bill.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {bill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {tag}
            </span>
          ))}
          {bill.tags.length > 3 && (
            <span className="text-[10px] text-muted-foreground">
              +{bill.tags.length - 3}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
