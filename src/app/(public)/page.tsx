import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const sampleBills = [
  { name: "Office Rent", amount: "$2,400", due: "Due Jun 1" },
  { name: "Cloud Hosting", amount: "$599", due: "Due Jun 12" },
  { name: "Electric Utility", amount: "$245", due: "Due Jun 5" },
];

const billsTotal = "$3,244";

const howItWorks = [
  {
    step: 1,
    title: "Add your bills",
    description:
      "Enter recurring and one-time bills with due dates and categories. BillFlow organizes everything in one place.",
  },
  {
    step: 2,
    title: "Get smart reminders",
    description:
      "Receive email notifications before payments are due. Nothing slips through the cracks.",
  },
  {
    step: 3,
    title: "Track spending trends",
    description:
      "See monthly breakdowns, category insights, and projected costs to make better financial decisions.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-start lg:py-20">
        <div className="max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.14em] text-primary">
            Smart bill tracking
          </p>
          <h1 className="text-4xl font-semibold leading-tight tracking-normal sm:text-5xl">
            Know every bill before it&rsquo;s due.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-muted-foreground">
            BillFlow helps small teams track upcoming payments, get timely
            reminders, and understand monthly spending &mdash; all in one place.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <Link href="/signup">
              <Button size="lg">Get started free</Button>
            </Link>
            <Link href="/features">
              <Button variant="outline" size="lg">
                Learn more
              </Button>
            </Link>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Upcoming bills
              </p>
              <p className="mt-1 text-2xl font-semibold">{billsTotal}</p>
            </div>
            <span className="rounded-md bg-background px-3 py-1 text-sm font-medium text-primary">
              {sampleBills.length} bills
            </span>
          </div>

          <div className="space-y-3 pt-4">
            {sampleBills.map((bill) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 rounded-md border border-border px-3 py-3"
                key={bill.name}
              >
                <div>
                  <p className="text-sm font-medium">{bill.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {bill.due}
                  </p>
                </div>
                <p className="text-sm font-semibold">{bill.amount}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto flex w-full max-w-2xl divide-x divide-border rounded-lg border border-border py-6">
          <div className="flex-1 px-4 text-center">
            <p className="text-2xl font-bold">1,200+</p>
            <p className="mt-1 text-sm text-muted-foreground">businesses</p>
          </div>
          <div className="flex-1 px-4 text-center">
            <p className="text-2xl font-bold">50,000+</p>
            <p className="mt-1 text-sm text-muted-foreground">bills tracked</p>
          </div>
          <div className="flex-1 px-4 text-center">
            <p className="text-2xl font-bold">99.8%</p>
            <p className="mt-1 text-sm text-muted-foreground">uptime</p>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20">
        <h2 className="text-center text-3xl font-semibold">How it works</h2>
        <div className="mt-12 flex flex-col items-center gap-8 md:flex-row md:items-start md:justify-center md:gap-0">
          {howItWorks.map((item, i) => (
            <div
              key={item.title}
              className="flex w-full flex-col items-center gap-0 md:flex-row md:flex-1"
            >
              <div className="flex flex-col items-center text-center md:max-w-64">
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                  {item.step}
                </div>
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </div>
              {i < howItWorks.length - 1 && (
                <div className="flex items-center justify-center py-3 md:py-0 md:px-3 md:pt-7">
                  <div className="h-10 w-px bg-border md:h-px md:w-12" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-white py-20">
        <div className="mx-auto max-w-6xl px-5">
          <blockquote className="mx-auto max-w-2xl text-center">
            <p className="text-lg italic leading-relaxed text-muted-foreground">
              &ldquo;BillFlow turned our bill chaos into a 10-minute weekly
              review. I no longer miss due dates or wonder where our money
              goes.&rdquo;
            </p>
            <footer className="mt-4 text-sm font-medium">
              Sarah Chen
              <span className="font-normal text-muted-foreground">
                , Greenline Landscaping
              </span>
            </footer>
          </blockquote>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-20 text-center">
        <h2 className="text-3xl font-semibold">
          Ready to organize your bills?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start tracking bills, getting reminders, and watching your cash flow
          in one place.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/signup">
            <Button size="lg" className="h-11 px-8 text-base">
              Get started free
              <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            Start free &mdash; no credit card required
          </p>
        </div>
      </section>
    </main>
  );
}
