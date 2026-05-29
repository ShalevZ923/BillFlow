"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

type MonthlyBreakdownProps = {
  monthlyBreakdown: Array<{ month: string; amountCents: number }>;
};

export function MonthlyBreakdown({ monthlyBreakdown }: MonthlyBreakdownProps) {
  if (monthlyBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <div className="flex h-64 items-center justify-center text-sm text-muted">
          No data yet
        </div>
      </Card>
    );
  }

  const data = monthlyBreakdown.map((item) => ({
    name: item.month,
    amount: Math.round(item.amountCents / 100)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cost Breakdown</CardTitle>
      </CardHeader>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => `$${value}`} />
            <Bar dataKey="amount" fill="#0d9488" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
