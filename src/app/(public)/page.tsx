import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Calendar, Zap, FileText, Lightbulb, DollarSign, Calculator, Upload, Inbox, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  mockUpcomingItems,
  mockMonthlyBreakdown,
  mockDashboardSummary,
  mockPricingPlans,
  mockFeaturedFeatures,
  mockIntakeSources
} from "@/lib/mock/data";

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

const featureIcons: Record<string, React.ReactNode> = {
  FileText: <FileText size={20} />,
  Lightbulb: <Lightbulb size={20} />,
  DollarSign: <DollarSign size={20} />,
  Calculator: <Calculator size={20} />,
  Upload: <Upload size={20} />,
  Inbox: <Inbox size={20} />
};

export default function Home() {
  const maxBar = Math.max(...mockMonthlyBreakdown.map((m) => m.amountCents));

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.04] to-transparent" />
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
                <Link href="/signup">
                  <Button size="lg" className="h-11 px-6 text-base">
                    Get started free
                    <ArrowRight size={16} />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" size="lg" className="h-11 px-6 text-base">
                    See how it works
                  </Button>
                </Link>
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
                  <p className="mt-1 text-2xl font-bold">
                    {formatCurrency(mockDashboardSummary.monthlyObligationsCents)}
                  </p>
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
                        {formatCurrency(item.amountCents)}
                      </p>
                      {item.priority === "critical" && (
                        <span className="text-xs font-medium text-destructive">Critical</span>
                      )}
                      {item.priority === "high" && (
                        <span className="text-xs font-medium text-yellow-600 dark:text-yellow-400">High</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-end gap-1 h-16">
                {mockMonthlyBreakdown.map((m) => {
                  const pct = maxBar > 0 ? (m.amountCents / maxBar) * 100 : 0;
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

      {/* Product Benefits Bar */}
      <section className="border-y border-border bg-white dark:bg-card">
        <div className="mx-auto flex max-w-4xl divide-x divide-border">
          {[
            { value: "Unlimited bills", label: "on Pro plan" },
            { value: "Due date reminders", label: "never miss a payment" },
            { value: "CSV import & export", label: "easy data migration" }
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
                {featureIcons[feature.icon]}
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
                {[
                  "Gmail bill detection",
                  "Google Sheets sync",
                  "CSV / Excel import",
                  "PDF invoice scanning",
                  "Invoicing platform (coming soon)"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <Check size={16} className="shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/features"
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary transition hover:text-primary/80"
              >
                Learn about intake
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6 dark:bg-muted/20">
              <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Connected Sources
              </p>
              <div className="space-y-3">
                {mockIntakeSources.map((src) => (
                  <div
                    key={src.id}
                    className="flex items-center gap-4 rounded-lg border border-border bg-white p-4 dark:bg-card"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground dark:bg-muted/50">
                      <Mail size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{src.name}</p>
                      <p className="text-xs text-muted-foreground">{src.description}</p>
                    </div>
                    {src.comingSoon ? (
                      <span className="shrink-0 rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground dark:bg-muted/50">
                        Coming soon
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-lg border border-border px-3 py-1.5 text-xs font-medium cursor-pointer hover:bg-muted dark:hover:bg-muted/50">
                        Connect
                      </span>
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
                <div className="absolute -top-3 right-4 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground dark:bg-muted/50">
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
              <Link
                href={plan.comingSoon ? "#" : plan.popular ? "/signup" : "/signup"}
                className={`mt-6 block w-full rounded-xl py-2.5 text-center text-sm font-semibold transition ${
                  plan.popular
                    ? "bg-primary text-white hover:bg-primary/90"
                    : plan.comingSoon
                      ? "cursor-not-allowed border border-border bg-muted text-muted-foreground dark:bg-muted/50"
                      : "border border-border bg-white hover:bg-muted dark:bg-card dark:hover:bg-muted/20"
                }`}
                aria-disabled={plan.comingSoon}
                tabIndex={plan.comingSoon ? -1 : undefined}
              >
                {plan.comingSoon ? "Coming soon" : plan.cta}
              </Link>
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
            <Link href="/signup">
              <Button size="lg" className="h-11 bg-white px-6 text-base font-semibold text-primary hover:bg-white/90">
                Get started free
                <ArrowRight size={16} />
              </Button>
            </Link>
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
            <div>
              <p className="text-sm font-semibold">Product</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/features" className="text-sm text-muted-foreground transition hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="text-sm text-muted-foreground transition hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Resources</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground transition hover:text-foreground">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground transition hover:text-foreground">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold">Company</p>
              <ul className="mt-3 space-y-2">
                <li>
                  <span className="text-sm text-muted-foreground">About — Coming soon</span>
                </li>
                <li>
                  <span className="text-sm text-muted-foreground">Contact — Coming soon</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-6 text-center">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} SeeHy Labs. All rights
              reserved. BillFlow is a product of SeeHy Labs.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
