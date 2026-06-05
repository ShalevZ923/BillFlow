"use client";

import { useState } from "react";
import { ArrowRightLeft, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { mockExchangeRates } from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

const currencies = currencyOptions;

const quickConversions = [
  { label: "USD → EUR", from: "USD", to: "EUR" },
  { label: "USD → GBP", from: "USD", to: "GBP" },
  { label: "USD → ILS", from: "USD", to: "ILS" },
  { label: "EUR → USD", from: "EUR", to: "USD" }
];

export default function CurrencyPage() {
  const [amount, setAmount] = useState("100");
  const [fromCurrency, setFromCurrency] = useState("USD");
  const [toCurrency, setToCurrency] = useState("EUR");

  const numAmount = parseFloat(amount) || 0;
  const toSymbol = getSymbol(toCurrency);
  const rate =
    mockExchangeRates[toCurrency] && mockExchangeRates[fromCurrency]
      ? mockExchangeRates[toCurrency] / mockExchangeRates[fromCurrency]
      : 1;
  const converted = numAmount * rate;

  function handleSwap() {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  }

  function handleQuick(from: string, to: string) {
    setFromCurrency(from);
    setToCurrency(to);
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Currency Converter</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Convert between supported currencies with live exchange rates.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle>Quick Convert</CardTitle>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  Demo Rates
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Amount</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-lg font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="grid grid-cols-[1fr_auto_1fr] gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium mb-1.5">From</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSwap}
                  className="mb-0.5 rounded-lg border border-border p-2 hover:bg-muted transition"
                  aria-label="Swap currencies"
                >
                  <ArrowRightLeft size={16} className="text-muted-foreground" />
                </button>
                <div>
                  <label className="block text-sm font-medium mb-1.5">To</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    {currencies.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-4 text-center dark:bg-muted/20">
                <p className="text-xs text-muted-foreground">Converted Amount</p>
                <p className="mt-1 text-2xl font-bold text-primary">
                  {toSymbol}{converted.toFixed(2)}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  1 {fromCurrency} = {rate.toFixed(4)} {toCurrency}
                </p>
              </div>

              <div className="flex gap-2">
                {quickConversions.map((qc) => {
                  const qr =
                    mockExchangeRates[qc.to] && mockExchangeRates[qc.from]
                      ? (mockExchangeRates[qc.to] / mockExchangeRates[qc.from]).toFixed(4)
                      : "—";
                  return (
                    <button
                      key={qc.label}
                      onClick={() => handleQuick(qc.from, qc.to)}
                      className="flex-1 rounded-lg border border-border bg-white px-2 py-2 text-center text-xs hover:bg-muted dark:bg-card"
                    >
                      <p className="font-medium">{qc.label}</p>
                      <p className="text-muted-foreground">{qr}</p>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe size={18} className="text-primary" />
                <CardTitle>Dashboard Currency</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Your dashboard totals are displayed in your chosen currency. Each
                bill keeps its original currency — totals are converted for your
                convenience.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Set your default currency in{" "}
                <Link href="/settings" className="text-primary hover:underline">
                  Settings
                </Link>
                .
              </p>
            </CardContent>
          </Card>

          <Card className="border-dashed">
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <CardTitle>Live Rates</CardTitle>
                <Badge>Pro</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Upgrade to Pro for live exchange rates that refresh every 6 hours.
                Free users see demo rates.
              </p>
              <Link href="/pricing" className="inline-block mt-3">
                <Button size="sm">
                  Upgrade to Pro
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
