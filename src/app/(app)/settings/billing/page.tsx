"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function BillingSettingsPage() {
  const [plan] = useState<"free" | "pro">("free");

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your subscription and billing details.</p>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Badge variant={plan === "pro" ? "success" : "default"}>
                {plan === "pro" ? "Pro" : "Free"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {plan === "free"
                  ? "Up to 25 bills, dashboard, CSV export, basic reminders"
                  : "Unlimited bills, AI insights, AI Fill, CSV import/export, live currency converter"}
              </span>
            </div>

            {plan === "free" && (
              <div className="mt-4">
                <Link href="/pricing">
                  <Button>
                    Upgrade to Pro
                    <ArrowRight size={14} />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pro Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Unlimited bills</li>
              <li>AI-powered daily insights</li>
              <li>AI Fill for quick bill creation</li>
              <li>CSV import for bulk bill management</li>
              <li>Live multi-currency converter</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
