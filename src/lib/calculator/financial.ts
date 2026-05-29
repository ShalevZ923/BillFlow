export function monthlyToYearly(monthlyCents: number): number {
  return monthlyCents * 12;
}

export function yearlyToMonthly(yearlyCents: number): number {
  return Math.round(yearlyCents / 12);
}

export function percentageChange(oldCents: number, newCents: number): number {
  if (oldCents === 0) return newCents > 0 ? 100 : 0;
  return Math.round(((newCents - oldCents) / oldCents) * 100);
}

export function totalFromCents(amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + a, 0);
}
