"use client";

import { currencyOptions } from "@/lib/currency/supported";

type DashboardCurrencySelectorProps = {
  value: string;
  onChange: (currency: string) => void;
};

export function DashboardCurrencySelector({ value, onChange }: DashboardCurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium text-muted">View in</label>
      <select
        className="h-8 rounded-md border border-border bg-white px-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {currencyOptions.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} {c.symbol}
          </option>
        ))}
      </select>
    </div>
  );
}
