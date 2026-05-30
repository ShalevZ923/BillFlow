"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer:
      "Yes. You can upgrade from Free to Pro at any time. Your data and settings stay intact. If you downgrade, Pro features are disabled but your data is preserved.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards through Stripe, including Visa, Mastercard, and American Express. Invoices are available for annual plans.",
  },
  {
    question: "Is there a free trial?",
    answer:
      "The Free plan is our trial &mdash; it is free forever with no time limit. You can try Pro for 14 days before your first payment.",
  },
  {
    question: "Can I cancel my subscription?",
    answer:
      "Absolutely. Cancel anytime from your account settings. Your Pro features remain active until the end of your current billing period. No questions asked.",
  },
];

const freeFeatures = [
  "Up to 25 bills",
  "CSV export",
  "Basic dashboard",
  "Email reminders",
  "Community support",
];

const proFeatures = [
  "Unlimited bills",
  "AI insights",
  "AI Fill",
  "CSV import & export",
  "Live currency converter",
  "Priority reminders",
];

const businessFeatures = [
  "Teams",
  "Multiple dashboards",
  "Roles & permissions",
  "Business controls",
];

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-5 py-20 text-center">
        <h1 className="text-4xl font-semibold">Simple, transparent pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start free. Upgrade when you need more power.
        </p>

        <div className="mt-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-border bg-muted p-1">
            <button
              onClick={() => setIsYearly(false)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition",
                !isYearly
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={cn(
                "rounded-md px-4 py-1.5 text-sm font-medium transition",
                isYearly
                  ? "bg-white text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {/* Free */}
          <Card>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Free</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-sm text-muted-foreground">
                    {" "}
                    forever
                  </span>
                </div>
              </div>
              <ul className="space-y-2 text-left">
                {freeFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check size={16} className="text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/signup">
                  <Button variant="outline" className="w-full">
                    Get started
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Pro */}
          <Card className="ring-2 ring-primary relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
              Popular
            </span>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Pro</h3>
                <div className="mt-2">
                  {isYearly ? (
                    <>
                      <span className="text-3xl font-bold">$9.60</span>
                      <span className="text-sm text-muted-foreground">
                        /month
                      </span>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground line-through">
                          $12.00/mo
                        </span>
                        <Badge variant="success">Save 20%</Badge>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-3xl font-bold">$12</span>
                      <span className="text-sm text-muted-foreground">
                        /month
                      </span>
                    </>
                  )}
                </div>
              </div>
              <ul className="space-y-2 text-left">
                {proFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check size={16} className="text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Link href="/signup">
                  <Button className="w-full">Start Pro trial</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Business */}
          <Card className="opacity-60 pointer-events-none select-none">
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Business</h3>
                <div className="mt-2">
                  <span className="text-3xl font-bold">Coming later</span>
                </div>
              </div>
              <ul className="space-y-2 text-left">
                {businessFeatures.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check size={16} className="text-primary shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button variant="outline" className="w-full" disabled>
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-5 pb-20">
        <h2 className="text-center text-2xl font-semibold">
          Frequently asked questions
        </h2>
        <div className="mt-10 divide-y divide-border rounded-lg border border-border bg-white">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => toggleFaq(i)}
                className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-medium transition hover:bg-muted/50"
              >
                {faq.question}
                <ChevronDown
                  size={18}
                  className={cn(
                    "shrink-0 text-muted-foreground transition-transform",
                    openFaq === i && "rotate-180"
                  )}
                />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
