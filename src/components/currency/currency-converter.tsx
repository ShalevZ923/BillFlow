"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { currencyOptions } from "@/lib/currency/supported";
import { ArrowRight, RefreshCw } from "lucide-react";

type ConversionResult = {
  currency: string;
  amountCents: number;
};

const mockRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  ILS: 3.65
};

export function CurrencyConverter() {
  const [amount, setAmount] = useState("100.00");
  const [from, setFrom] = useState("USD");
  const [results, setResults] = useState<ConversionResult[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  function handleConvert() {
    const amountCents = Math.round(parseFloat(amount) * 100);
    const fromRate = mockRates[from as keyof typeof mockRates] ?? 1;
    const converted = currencyOptions
      .filter((c) => c.code !== from)
      .map((c) => {
        const toRate = mockRates[c.code as keyof typeof mockRates] ?? 1;
        return {
          currency: c.code,
          amountCents: Math.round((amountCents / fromRate) * toRate)
        };
      });

    setResults(converted);
    setLastUpdated(new Date().toISOString());
  }

  return (
    <div>
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Amount</label>
          <Input
            className="w-32"
            placeholder="100.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium">From</label>
          <select
            className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>
        <Button onClick={handleConvert}>
          <RefreshCw size={16} />
          Convert
        </Button>
      </div>

      {results.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">Results</h3>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Rates updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {results.map((r) => (
              <Card key={r.currency}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        {currencyOptions.find((c) => c.code === r.currency)?.label ?? r.currency}
                      </p>
                      <p className="text-xs text-muted-foreground">{r.currency}</p>
                    </div>
                    <ArrowRight size={16} className="text-muted-foreground" />
                    <p className="text-lg font-bold">
                      {(r.amountCents / 100).toFixed(2)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
