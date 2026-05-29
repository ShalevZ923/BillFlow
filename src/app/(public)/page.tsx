import Link from "next/link";
import { ArrowRight, Bell, FileText, LineChart } from "lucide-react";
import { Button } from "@/components/ui/button";

const workflowItems = [
  {
    title: "Track invoices",
    description: "Keep every sent, paid, overdue, and disputed invoice visible in one operating view.",
    icon: FileText
  },
  {
    title: "Automate reminders",
    description: "Prepare polite follow-ups before balances turn into manual collection work.",
    icon: Bell
  },
  {
    title: "Watch cash flow",
    description: "See upcoming receipts and late-risk accounts before they surprise the business.",
    icon: LineChart
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Receivables workflow
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Billing follow-up without spreadsheet drift.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted">
            BillFlow helps small teams monitor invoices, schedule reminders, and understand what
            payments are at risk before month-end.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/features">
              <Button variant="secondary" size="lg">
                Learn more
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm font-medium text-muted">Open receivables</p>
              <p className="mt-1 text-2xl font-semibold">$42,860</p>
            </div>
            <span className="rounded-md bg-background px-3 py-1 text-sm font-medium text-primary">
              18 invoices
            </span>
          </div>

          <div className="space-y-3 pt-4">
            {[
              ["Northstar Studio", "$7,200", "Due today"],
              ["Keller Supply", "$12,450", "3 days overdue"],
              ["Ridge Accounting", "$4,980", "Reminder queued"]
            ].map(([client, amount, status]) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-border px-3 py-3"
                key={client}
              >
                <div>
                  <p className="text-sm font-medium">{client}</p>
                  <p className="mt-1 text-sm text-muted">{status}</p>
                </div>
                <p className="text-sm font-semibold">{amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto grid w-full max-w-6xl gap-4 px-5 py-8 md:grid-cols-3">
          {workflowItems.map((item) => {
            const Icon = item.icon;

            return (
              <article className="rounded-lg border border-border p-5" key={item.title}>
                <Icon aria-hidden="true" className="text-primary" size={22} />
                <h2 className="mt-4 text-base font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 text-center">
        <h2 className="text-3xl font-semibold">Ready to organize your bills?</h2>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Start tracking invoices, automating reminders, and watching your cash flow in one place.
        </p>
        <div className="mt-8">
          <Link href="/signup">
            <Button size="lg">
              Get started free
              <ArrowRight size={16} />
            </Button>
          </Link>
        </div>
      </section>
    </main>
  );
}
