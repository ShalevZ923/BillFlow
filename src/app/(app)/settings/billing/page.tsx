"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getProfile } from "@/app/(app)/settings/actions";

export default function BillingSettingsPage() {
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then((profile) => {
      setPlan((profile?.plan as "free" | "pro") ?? "free");
      setLoading(false);
    }).catch(() => {
      setPlan("free");
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <div>
          <Skeleton className="h-7 w-24 mb-1" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="mt-6 space-y-6">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

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
