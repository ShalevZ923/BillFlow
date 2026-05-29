"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrencyConverter } from "@/components/currency/currency-converter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CurrencyPage() {
  const [plan] = useState<"free" | "pro">("free");

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Currency</h1>
        <p className="mt-1 text-sm text-muted-foreground">Convert amounts between supported currencies.</p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Live Currency Converter</CardTitle>
              <Badge variant="warning">Pro</Badge>
            </div>
          </CardHeader>
          {plan === "free" ? (
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">
                Live multi-currency conversion is available on the Pro plan. Dashboard currency
                totals are still calculated for all plans.
              </p>
              <Link href="/pricing">
                <Button variant="outline">
                  Upgrade to Pro
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </CardContent>
          ) : (
            <CardContent>
              <CurrencyConverter />
            </CardContent>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Currency</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your dashboard displays totals in a currency you choose from the dashboard selector.
              Each bill stores its own original currency, and amounts are converted for display
              purposes only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
