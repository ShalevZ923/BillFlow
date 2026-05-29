import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    interval: "forever",
    features: ["Up to 25 bills", "Dashboard", "CSV export", "Basic reminders", "Currency totals"]
  },
  {
    name: "Pro",
    price: "$12",
    interval: "/month",
    features: [
      "Unlimited bills",
      "AI insights",
      "AI Fill",
      "CSV import & export",
      "Live currency converter",
      "Priority reminders"
    ],
    highlighted: true
  },
  {
    name: "Business",
    price: "Coming later",
    interval: "",
    features: ["Teams", "Multiple dashboards", "Roles & permissions", "Business controls"]
  }
];

export default function Pricing() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto w-full max-w-5xl px-5 py-20 text-center">
        <h1 className="text-4xl font-semibold">Simple, transparent pricing</h1>
        <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
          Start free. Upgrade when you need more power.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.highlighted
                  ? "ring-2 ring-primary relative"
                  : ""
              }
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    {plan.interval && (
                      <span className="text-sm text-muted-foreground">{plan.interval}</span>
                    )}
                  </div>
                </div>
                <ul className="space-y-2 text-left">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Check size={16} className="text-primary shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {plan.highlighted ? (
                    <Link href="/signup">
                      <Button className="w-full">Start Pro trial</Button>
                    </Link>
                  ) : plan.price === "$0" ? (
                    <Link href="/signup">
                      <Button variant="outline" className="w-full">
                        Get started
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      Coming later
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
