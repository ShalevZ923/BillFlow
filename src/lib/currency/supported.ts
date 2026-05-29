import { supportedCurrencies, type CurrencyCode } from "@/lib/billing/types";

export { supportedCurrencies, type CurrencyCode };

export const currencyOptions = [
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "EUR" },
  { code: "GBP", label: "British Pound", symbol: "GBP" },
  { code: "ILS", label: "Israeli Shekel", symbol: "ILS" }
] as const satisfies ReadonlyArray<{ code: CurrencyCode; label: string; symbol: string }>;
