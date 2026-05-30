import {
  LayoutDashboard,
  FileText,
  Bell,
  BarChart3,
  Sparkles,
  Upload,
  DollarSign,
  Shield,
  Clock,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const featureGroups = [
  {
    title: "Track & Organize",
    items: [
      {
        title: "Dashboard command center",
        description:
          "One view shows what you owe, what is coming, what is overdue, and where costs concentrate.",
        icon: LayoutDashboard,
      },
      {
        title: "Recurring bill tracking",
        description:
          "Define bills once and let BillFlow plan 12 months of occurrences. Unpaid bills are never hidden.",
        icon: Clock,
      },
      {
        title: "Multi-currency",
        description:
          "Live currency conversion with cached rates. Dashboard totals in your preferred currency.",
        icon: DollarSign,
        pro: true,
      },
    ],
  },
  {
    title: "Collect & Automate",
    items: [
      {
        title: "Payment records",
        description:
          "Record payments with method, date, and notes. Overdue history stays visible.",
        icon: FileText,
      },
      {
        title: "Smart reminders",
        description:
          "Email and browser push notifications 7 days before, 1 day before, and when overdue.",
        icon: Bell,
      },
      {
        title: "CSV Import & Export",
        description:
          "Import bills in bulk with preview and validation. Export filtered lists anytime.",
        icon: Upload,
        pro: true,
      },
    ],
  },
  {
    title: "Smart Insights",
    items: [
      {
        title: "AI-powered extraction",
        description:
          "Scan and auto-fill bill details from documents using AI. Save hours of manual entry.",
        icon: Sparkles,
        pro: true,
      },
      {
        title: "Daily insights",
        description:
          "Daily AI-generated summary of patterns, risk areas, unusual changes, and suggested actions.",
        icon: BarChart3,
        pro: true,
      },
      {
        title: "Secure by default",
        description:
          "Email/password and Google login through Supabase. Stripe for payments.",
        icon: Shield,
      },
    ],
  },
];

export default function Features() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-5 py-20 text-center">
        <h1 className="text-4xl font-semibold">
          Everything you need to stay on top of bills
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          BillFlow combines tracking, reminders, and insights into one
          dashboard.
        </p>

        <div className="mt-16 text-left">
          {featureGroups.map((group) => (
            <div key={group.title} className="mb-12">
              <h2 className="text-lg font-semibold">{group.title}</h2>
              <hr className="mt-3 mb-6 border-border" />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <article
                      key={feature.title}
                      className="rounded-lg border border-border bg-white p-5 shadow-xs"
                    >
                      <Icon aria-hidden="true" className="text-primary" size={22} />
                      <h3 className="mt-3 flex items-center gap-2 text-base font-semibold">
                        {feature.title}
                        {feature.pro && <Badge variant="default">Pro</Badge>}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {feature.description}
                      </p>
                    </article>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
