"use client";

import { useState, useEffect } from "react";
import { format, parse } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip
} from "recharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatMonthLabel(raw: string): string {
  try {
    const date = parse(raw, "yyyy-MM", new Date());
    if (isNaN(date.getTime())) return raw;
    return format(date, "MMM yyyy");
  } catch {
    return raw;
  }
}

type MonthlyBreakdownProps = {
  monthlyBreakdown: Array<{ month: string; amountCents: number }>;
};

export function MonthlyBreakdown({ monthlyBreakdown }: MonthlyBreakdownProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (monthlyBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
            No data yet
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Cost Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-64 items-end justify-around gap-2 px-4">
            <Skeleton className="h-1/3 w-8" />
            <Skeleton className="h-1/2 w-8" />
            <Skeleton className="h-3/4 w-8" />
            <Skeleton className="h-full w-8" />
            <Skeleton className="h-2/3 w-8" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const data = monthlyBreakdown.map((item) => ({
    name: formatMonthLabel(item.month),
    amount: Math.round(item.amountCents / 100)
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Cost Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb" }}
                formatter={(value) => `$${value}`}
              />
              <Bar dataKey="amount" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
