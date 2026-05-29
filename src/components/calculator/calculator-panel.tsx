"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { monthlyToYearly, yearlyToMonthly, percentageChange } from "@/lib/calculator/financial";

export function CalculatorPanel() {
  const [monthly, setMonthly] = useState("");
  const [yearly, setYearly] = useState("");
  const [oldAmount, setOldAmount] = useState("");
  const [newAmount, setNewAmount] = useState("");

  const monthlyCents = Math.round(parseFloat(monthly || "0") * 100);
  const yearlyCents = Math.round(parseFloat(yearly || "0") * 100);
  const oldCents = Math.round(parseFloat(oldAmount || "0") * 100);
  const newCents = Math.round(parseFloat(newAmount || "0") * 100);

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle>Monthly to Yearly</CardTitle>
        </CardHeader>
        <Input
          className="mb-2"
          placeholder="Monthly amount"
          value={monthly}
          onChange={(e) => setMonthly(e.target.value)}
        />
        {monthlyCents > 0 && (
          <p className="text-lg font-bold text-primary">
            ${(monthlyToYearly(monthlyCents) / 100).toFixed(2)}/year
          </p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Yearly to Monthly</CardTitle>
        </CardHeader>
        <Input
          className="mb-2"
          placeholder="Yearly amount"
          value={yearly}
          onChange={(e) => setYearly(e.target.value)}
        />
        {yearlyCents > 0 && (
          <p className="text-lg font-bold text-primary">
            ${(yearlyToMonthly(yearlyCents) / 100).toFixed(2)}/month
          </p>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>% Change</CardTitle>
        </CardHeader>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="Old amount"
            value={oldAmount}
            onChange={(e) => setOldAmount(e.target.value)}
          />
          <Input
            placeholder="New amount"
            value={newAmount}
            onChange={(e) => setNewAmount(e.target.value)}
          />
        </div>
        {oldCents > 0 && (
          <p className="text-lg font-bold text-primary">
            {percentageChange(oldCents, newCents)}%
          </p>
        )}
      </Card>
    </div>
  );
}
