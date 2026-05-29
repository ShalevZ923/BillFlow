"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { currencyOptions } from "@/lib/currency/supported";

export default function SettingsPage() {
  const [name, setName] = useState("Alex");
  const [currency, setCurrency] = useState("USD");
  const [emailReminders, setEmailReminders] = useState(true);
  const [pushReminders, setPushReminders] = useState(false);

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="mt-1 text-sm text-muted">Manage your profile and preferences.</p>
      </div>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Default Currency</label>
              <select
                className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {currencyOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({c.symbol})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Reminders</CardTitle>
          </CardHeader>
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary"
                checked={emailReminders}
                onChange={(e) => setEmailReminders(e.target.checked)}
              />
              <span className="text-sm">Email reminders (7 days, 1 day, overdue)</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-border text-primary"
                checked={pushReminders}
                onChange={(e) => setPushReminders(e.target.checked)}
              />
              <span className="text-sm">Browser push notifications</span>
            </label>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Billing</CardTitle>
          </CardHeader>
          <p className="mb-3 text-sm text-muted">
            Manage your subscription plan.
          </p>
          <Link href="/settings/billing">
            <Button variant="secondary">
              Billing settings
              <ArrowRight size={14} />
            </Button>
          </Link>
        </Card>
      </div>
    </div>
  );
}
