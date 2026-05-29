"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { currencyOptions } from "@/lib/currency/supported";

type DashboardCurrencySelectorProps = {
  value: string;
  onChange: (currency: string) => void;
};

export function DashboardCurrencySelector({ value, onChange }: DashboardCurrencySelectorProps) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-muted-foreground">View in</label>
      <Select value={value} onValueChange={(v) => v && onChange(v)}>
        <SelectTrigger className="h-8 w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {currencyOptions.map((c) => (
            <SelectItem key={c.code} value={c.code}>
              {c.code} {c.symbol}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
