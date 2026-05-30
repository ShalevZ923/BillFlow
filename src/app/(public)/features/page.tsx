import Link from "next/link";
import {
  FileText, Lightbulb, DollarSign, Calculator, Upload, Inbox,
  Sparkles, ArrowRight, Check, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: <FileText size={24} />,
    title: "Bill Tracking",
    description: "Track every recurring and one-time bill in a single organized view. Never miss a due date again with smart reminders and at-a-glance status indicators.",
    details: ["Recurring & one-time bills", "Due date tracking", "Status indicators (paid, unpaid, overdue)", "Priority levels (critical, high, medium, low)", "Tags and categories"]
  },
  {
    icon: <Lightbulb size={24} />,
    title: "Smart Insights",
    description: "AI-powered spending analysis that surfaces trends, anomalies, and savings opportunities from your billing data.",
    details: ["Daily AI-generated insights (Pro)", "Spending pattern detection", "Anomaly alerts", "Category concentration warnings", "Savings opportunity suggestions"],
    pro: true
  },
  {
    icon: <DollarSign size={24} />,
    title: "Currency Conversion",
    description: "Convert between USD, EUR, GBP, and ILS with live exchange rates. View every bill in your preferred currency.",
    details: ["4 supported currencies", "Live exchange rates (Pro)", "Demo rates (Free)", "Dashboard currency switching", "Per-bill original currency"],
    pro: true
  },
  {
    icon: <Calculator size={24} />,
    title: "Financial Calculator",
    description: "Monthly projections, yearly totals, percentage changes, and subscription cost analysis — all in one tool.",
    details: ["Monthly → Yearly projections", "Yearly → Monthly breakdowns", "Percentage change calculator", "Subscription annual cost", "Multi-bill totaling"]
  },
  {
    icon: <Upload size={24} />,
    title: "Import & Export",
    description: "Bring in bills from CSV, Excel, and Google Sheets. Export filtered reports in seconds for analysis or accounting.",
    details: ["CSV import with validation (Pro)", "CSV export (all plans)", "Column mapping", "Duplicate detection", "Preview before import"],
    pro: true
  },
  {
    icon: <Inbox size={24} />,
    title: "Omnichannel Intake",
    description: "Bills can come from Gmail, spreadsheets, PDFs, or invoicing platforms. One unified intake center to review them all.",
    details: ["Gmail bill detection", "Google Sheets sync", "CSV / Excel import", "PDF invoice upload (coming soon)", "Confidence scoring & review"]
  }
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium dark:bg-card">
          <Zap size={12} className="text-primary" />
          Made by SeeHy Labs
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Everything you need to stay ahead of your bills
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          BillFlow by SeeHy gives you the tools to track, analyze, and manage
          every financial obligation from one clean dashboard.
        </p>
      </section>

      {/* Feature Details */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="space-y-16">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              className={`grid gap-8 lg:grid-cols-2 lg:items-center ${
                i % 2 === 1 ? "lg:grid-flow-dense" : ""
              }`}
            >
              <div className={i % 2 === 1 ? "lg:col-start-2" : ""}>
                <div className="mb-4 flex items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  {feature.pro && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold text-primary-foreground">
                      Pro
                    </span>
                  )}
                </div>
                <h2 className="text-2xl font-bold tracking-tight">{feature.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {feature.details.map((detail) => (
                    <li key={detail} className="flex items-center gap-3 text-sm">
                      <Check size={14} className="shrink-0 text-primary" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
              <div className={`rounded-2xl border border-border bg-white p-8 dark:bg-card ${i % 2 === 1 ? "lg:col-start-1 lg:row-start-1" : ""}`}>
                {/* Feature illustration placeholder */}
                <div className="flex h-64 items-center justify-center rounded-xl bg-muted/50 dark:bg-muted/30">
                  <div className="text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <p className="mt-3 text-sm font-medium">{feature.title}</p>
                    <p className="text-xs text-muted-foreground">Interactive preview</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-y border-border bg-primary py-16">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to take control?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Start tracking your bills with BillFlow today — free.
          </p>
          <div className="mt-6">
            <Link href="/signup">
              <Button size="lg" className="h-11 bg-white px-6 text-base font-semibold text-primary hover:bg-white/90">
                Get started free
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
