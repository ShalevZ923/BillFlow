"use client";

import { useState } from "react";
import { Mail, Shield, Globe, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { mockUserProfile, mockIntakeSources } from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";
import type { CurrencyCode } from "@/lib/billing/types";
import Link from "next/link";

export default function SettingsPage() {
  const [name, setName] = useState(mockUserProfile.name);
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>(mockUserProfile.defaultCurrency);
  const [email7d, setEmail7d] = useState(true);
  const [email1d, setEmail1d] = useState(true);
  const [emailOverdue, setEmailOverdue] = useState(true);
  const [push, setPush] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your profile, preferences, and account.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  value={mockUserProfile.email}
                  disabled
                  className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground outline-none dark:bg-muted/50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Default Currency</label>
                <select
                  value={defaultCurrency}
                  onChange={(e) => setDefaultCurrency(e.target.value as CurrencyCode)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                >
                  {currencyOptions.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <Button size="sm" className="mt-4">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail size={18} className="text-primary" />
              <CardTitle>Notifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Email reminders (7 days before)", value: email7d, setter: setEmail7d },
              { label: "Email reminders (1 day before)", value: email1d, setter: setEmail1d },
              { label: "Email reminders (on overdue)", value: emailOverdue, setter: setEmailOverdue },
              { label: "Browser push notifications", value: push, setter: setPush }
            ].map((item) => (
              <label
                key={item.label}
                className="flex items-center justify-between py-2 cursor-pointer"
              >
                <span className="text-sm">{item.label}</span>
                <button
                  role="switch"
                  aria-checked={item.value}
                  onClick={() => item.setter(!item.value)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    item.value ? "bg-primary" : "bg-border"
                  }`}
                >
                  <span
                    className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                      item.value ? "translate-x-[18px]" : "translate-x-[2px]"
                    }`}
                  />
                </button>
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Plan & Billing */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              <CardTitle>Plan & Billing</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Current Plan</span>
                  <Badge variant="secondary" className="uppercase text-[10px]">
                    Free
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Up to 25 bills, basic features.
                </p>
              </div>
              <Link href="/pricing">
                <Button>Upgrade to Pro</Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Team Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users size={18} className="text-primary" />
              <CardTitle>Team Settings</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Team Access</span>
                  <Badge variant="secondary" className="text-[10px]">
                    Business
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upgrade to Business for team collaboration.
                </p>
              </div>
              <Button variant="outline" disabled className="cursor-not-allowed">
                Locked
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Connected Sources */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe size={18} className="text-primary" />
              <CardTitle>Connected Sources</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Manage your connected bill intake sources.
            </p>
            {mockIntakeSources.slice(0, 4).map((src) => (
              <div
                key={src.id}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground dark:bg-muted/50">
                    <Mail size={14} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{src.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {src.connected ? "Connected" : "Not connected"}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  {src.comingSoon ? "Coming soon" : "Connect"}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
