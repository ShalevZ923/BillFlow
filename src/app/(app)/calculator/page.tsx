"use client";

import { useState } from "react";
import { Calculator, TrendingUp, Percent } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { currencyOptions } from "@/lib/currency/supported";

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

export default function CalculatorPage() {
  const [mode, setMode] = useState<"simple" | "advanced">("simple");

  // Simple: Monthly → Yearly
  const [monthlyAmount, setMonthlyAmount] = useState("2500");
  const [calcCurrency, setCalcCurrency] = useState("USD");
  const symbol = getSymbol(calcCurrency);
  const monthlyNum = parseFloat(monthlyAmount) || 0;
  const yearlyTotal = monthlyNum * 12;

  // Advanced: Yearly → Monthly
  const [yearlyAmount, setYearlyAmount] = useState("30000");
  const yearlyNum = parseFloat(yearlyAmount) || 0;
  const monthlyFromYearly = yearlyNum / 12;

  // Advanced: Percentage change
  const [oldValue, setOldValue] = useState("1000");
  const [newValue, setNewValue] = useState("1200");
  const oldNum = parseFloat(oldValue) || 0;
  const newNum = parseFloat(newValue) || 0;
  const pctChange = oldNum !== 0 ? ((newNum - oldNum) / oldNum) * 100 : 0;

  // Advanced: Subscription annual cost
  const [subAmount, setSubAmount] = useState("12");
  const [subPeriod, setSubPeriod] = useState("monthly");
  const subNum = parseFloat(subAmount) || 0;
  const subAnnual = subPeriod === "monthly" ? subNum * 12 : subNum;
  const subMonthly = subPeriod === "yearly" ? subNum / 12 : subNum;

  // Advanced: Multi-bill total
  const [billAmounts, setBillAmounts] = useState(["120.50", "2800", "72", "59.99"]);
  const multiBillTotal = billAmounts.reduce((sum, a) => sum + (parseFloat(a) || 0), 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Financial Calculator</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Simple and advanced financial calculations.
        </p>
      </div>

      {/* Mode Selector */}
      <div className="mb-6 inline-flex rounded-lg border border-border bg-muted p-1 dark:bg-muted/50">
        {[
          { key: "simple", label: "Simple" },
          { key: "advanced", label: "Advanced" }
        ].map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key as "simple" | "advanced")}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              mode === m.key
                ? "bg-white shadow-sm dark:bg-card"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {mode === "simple" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Monthly → Yearly */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <CardTitle>Monthly → Yearly Projection</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Monthly Amount</label>
                <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <select
                    value={calcCurrency}
                    onChange={(e) => setCalcCurrency(e.target.value)}
                    className="border-r border-border bg-muted px-2 py-2 text-sm outline-none dark:bg-muted/50"
                  >
                    <option>USD</option>
                    <option>EUR</option>
                    <option>GBP</option>
                    <option>ILS</option>
                  </select>
                  <input
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(e.target.value)}
                    className="flex-1 bg-background px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 p-4 text-center dark:bg-primary/10">
                <p className="text-xs text-muted-foreground">Yearly Total</p>
                <p className="text-2xl font-bold text-primary">
                  {symbol}{yearlyTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Yearly → Monthly */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-primary" />
                <CardTitle>Yearly → Monthly Breakdown</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">Yearly Amount</label>
                <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                  <span className="flex items-center border-r border-border bg-muted px-2 py-2 text-sm text-muted-foreground dark:bg-muted/50">
                    {symbol}
                  </span>
                  <input
                    type="number"
                    value={yearlyAmount}
                    onChange={(e) => setYearlyAmount(e.target.value)}
                    className="flex-1 bg-background px-3 py-2 text-sm outline-none"
                  />
                </div>
              </div>
              <div className="rounded-lg bg-primary/5 p-4 text-center dark:bg-primary/10">
                <p className="text-xs text-muted-foreground">Monthly Equivalent</p>
                <p className="text-2xl font-bold text-primary">
                  {symbol}{monthlyFromYearly.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Percentage Change */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Percent size={18} className="text-primary" />
                <CardTitle>Percentage Change</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Old Value</label>
                  <input
                    type="number"
                    value={oldValue}
                    onChange={(e) => setOldValue(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">New Value</label>
                  <input
                    type="number"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <div
                className={`rounded-lg p-4 text-center ${
                  pctChange >= 0
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-destructive/5 dark:bg-destructive/10"
                }`}
              >
                <p className="text-xs text-muted-foreground">Change</p>
                <p
                  className={`text-2xl font-bold ${
                    pctChange >= 0
                      ? "text-green-600 dark:text-green-400"
                      : "text-destructive"
                  }`}
                >
                  {pctChange >= 0 ? "+" : ""}
                  {pctChange.toFixed(2)}%
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Annual Cost */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                <CardTitle>Subscription Annual Cost</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-3">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1.5">Amount</label>
                  <div className="flex rounded-lg border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="flex items-center border-r border-border bg-muted px-2 py-2 text-sm text-muted-foreground dark:bg-muted/50">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      value={subAmount}
                      onChange={(e) => setSubAmount(e.target.value)}
                      className="flex-1 bg-background px-3 py-2 text-sm outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Period</label>
                  <select
                    value={subPeriod}
                    onChange={(e) => setSubPeriod(e.target.value)}
                    className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-primary/5 p-3 text-center dark:bg-primary/10">
                  <p className="text-xs text-muted-foreground">Annual Cost</p>
                  <p className="text-lg font-bold text-primary">
                    {symbol}{subAnnual.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="rounded-lg bg-primary/5 p-3 text-center dark:bg-primary/10">
                  <p className="text-xs text-muted-foreground">Monthly Equivalent</p>
                  <p className="text-lg font-bold text-primary">
                    {symbol}{subMonthly.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Multi-Bill Total */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calculator size={18} className="text-primary" />
                <CardTitle>Multi-Bill Total</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                {billAmounts.map((val, i) => (
                  <div key={i} className="flex items-center rounded-lg border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                    <span className="border-r border-border bg-muted px-2 py-2 text-xs text-muted-foreground dark:bg-muted/50">
                      {symbol}
                    </span>
                    <input
                      type="number"
                      value={val}
                      onChange={(e) => {
                        const next = [...billAmounts];
                        next[i] = e.target.value;
                        setBillAmounts(next);
                      }}
                      className="flex-1 bg-background px-2 py-2 text-sm outline-none w-full"
                    />
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-primary/5 p-4 text-center dark:bg-primary/10">
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-primary">
                  {symbol}{multiBillTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
