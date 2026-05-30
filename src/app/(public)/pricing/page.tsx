import Link from "next/link";
import { Check, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockPricingPlans } from "@/lib/mock/data";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-xs font-medium dark:bg-card">
          <Zap size={12} className="text-primary" />
          Made by SeeHy Labs
        </div>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
          Simple, transparent pricing
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Start free, upgrade when you need more power. No hidden fees, no
          surprises.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-6 lg:grid-cols-3">
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
                href={plan.comingSoon ? "#" : "/signup"}
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

      {/* FAQ */}
      <section className="border-t border-border bg-white py-16 dark:bg-card">
        <div className="mx-auto max-w-3xl px-5">
          <h2 className="text-2xl font-bold text-center">Frequently asked questions</h2>
          <div className="mt-8 space-y-6">
            {[
              {
                q: "Can I switch plans later?",
                a: "Yes. You can upgrade from Free to Pro at any time. Downgrading to Free will apply at the end of your billing period."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit and debit cards through Stripe. Invoices are available for Business plan customers."
              },
              {
                q: "Is my financial data secure?",
                a: "Yes. All data is encrypted in transit and at rest. We use Supabase for secure database storage and never share your data with third parties."
              },
              {
                q: "Can I cancel anytime?",
                a: "Absolutely. There are no long-term contracts. You can cancel your Pro subscription at any time and keep access until the end of your billing period."
              }
            ].map((faq) => (
              <div key={faq.q}>
                <h3 className="font-semibold">{faq.q}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-primary py-16">
        <div className="mx-auto max-w-2xl px-5 text-center">
          <h2 className="text-3xl font-bold text-white">
            Ready to get started?
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join thousands of businesses and freelancers who trust BillFlow by SeeHy.
          </p>
          <div className="mt-6">
            <Link href="/signup">
              <Button size="lg" className="h-11 bg-white px-6 text-base font-semibold text-primary hover:bg-white/90">
                Start free today
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
