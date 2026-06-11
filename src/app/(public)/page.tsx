import Link from "next/link";
import { ArrowRight, CheckCircle2, FileDown, MailCheck, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BillflowPreview } from "@/components/public/billflow-preview";

const workflowItems = [
  {
    icon: MailCheck,
    title: "Unified bill inbox",
    description: "Bring email, CSV, PDF, and manual entries into one clean bill queue."
  },
  {
    icon: CheckCircle2,
    title: "Smart reminders",
    description: "See overdue, due-today, and upcoming obligations before they become problems."
  },
  {
    icon: WalletCards,
    title: "Payments that fit you",
    description: "Record payment methods, paid dates, and currency-aware totals in the same flow."
  },
  {
    icon: FileDown,
    title: "Exportable history",
    description: "Keep a usable audit trail for reporting, handoff, and cleanup work."
  }
];

const plans = [
  { name: "Free", price: "$0", detail: "Track the first bills and payment history." },
  { name: "Pro", price: "$12", detail: "More bills, imports, reminders, and richer analytics." },
  { name: "Business", price: "Soon", detail: "Team workflows, approvals, and advanced controls." }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-5 pb-12 pt-14 lg:grid-cols-[minmax(0,0.78fr)_minmax(520px,1fr)] lg:items-center lg:pb-16 lg:pt-20">
          <div>
            <h1 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Bills stop being surprises.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
              BillFlow turns due dates, payment status, reminders, imports, and currency-aware totals into one
              operational bill workspace.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/signup">
                <Button size="lg" className="h-11 px-5 text-base">
                  Get started free
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="outline" size="lg" className="h-11 px-5 text-base">
                  See how it works
                </Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-3 text-sm sm:grid-cols-3">
              {[
                "Overdue, due today, and upcoming in one queue",
                "Payments, reminders, and currency-aware totals",
                "Import bills from email, PDF, CSV, or manual entry"
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 shrink-0 text-primary" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <BillflowPreview />
        </div>
      </section>

      <section className="border-b border-border bg-card">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[0.7fr_1fr] lg:items-start">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Operational bill control</h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-muted-foreground">
              The public site now mirrors the product: focused, queue-first, and built around the daily work of staying
              ahead of obligations.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {workflowItems.map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-background p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon />
                </div>
                <h3 className="mt-4 font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-border">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-3">
          {plans.map((plan) => (
            <div key={plan.name} className="rounded-lg border border-border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{plan.detail}</p>
                </div>
                <p className="text-xl font-bold text-primary">{plan.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-primary py-14">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 text-primary-foreground md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ready to clean up the bill queue?</h2>
            <p className="mt-2 text-sm text-primary-foreground/75">Start free. No credit card required.</p>
          </div>
          <Link href="/signup">
            <Button size="lg" className="bg-card text-foreground hover:bg-card/90">
              Sign up free
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-border bg-card py-10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} SeeHy Labs. BillFlow is a product of SeeHy Labs.</p>
          <div className="flex gap-4">
            <Link className="hover:text-foreground" href="/privacy">
              Privacy
            </Link>
            <Link className="hover:text-foreground" href="/terms">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
