"use client";

import { useState, useEffect } from "react";
import { Mail, Plus, X, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ComingSoonBadge } from "@/components/ui/coming-soon-badge";
import { WorkInProgressBanner } from "@/components/ui/work-in-progress-banner";
import { useComingSoon } from "@/hooks/use-coming-soon";
import { mockIntakeSources, mockDetectedBills } from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";
import { getUserPlan } from "./actions";
import Link from "next/link";

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(c: number, code: string): string {
  return `${getSymbol(code)}${formatCents(c)}`;
}

export default function IntakePage() {
  const [detected] = useState(mockDetectedBills);
  const [plan, setPlan] = useState<"free" | "pro" | null>(null);
  const { toastElement, showComingSoon } = useComingSoon();

  useEffect(() => {
    getUserPlan().then(setPlan);
  }, []);

  function handleApprove() {
    showComingSoon("Bill approval workflow is coming soon!");
  }

  function handleDismiss() {
    showComingSoon("Bill dismissal is coming soon!");
  }

  if (plan === "free") {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <Lock size={24} className="text-muted-foreground" />
        </div>
        <h1 className="text-xl font-bold tracking-tight">Intake Center</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-md">
          The Intake Center is a Pro feature. Upgrade your plan to connect
          bill sources and automate bill detection.
        </p>
        <Link href="/pricing" className="mt-6">
          <Button>
            Upgrade to Pro
          </Button>
        </Link>
      </div>
    );
  }

  if (plan === null) return null;

  return (
    <div>
      <WorkInProgressBanner />

      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Intake Center{" "}
          <Badge variant="warning" className="ml-2 align-middle">In Progress</Badge>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Connect your bill sources and manage detected bills in one place.
        </p>
      </div>

      <h2 className="text-lg font-semibold mb-4">Connected Sources</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {mockIntakeSources.map((src) => (
          <div
            key={src.id}
            className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground dark:bg-muted/50">
                <Mail size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold">{src.name}</p>
                <p className="text-xs text-muted-foreground">
                  {src.connected
                    ? `${src.billsFound} bills found`
                    : "Not connected"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              {src.description}
            </p>
            {src.comingSoon ? (
              <ComingSoonBadge />
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  showComingSoon("Source connections are coming soon!")
                }
              >
                <Plus size={12} />
                Connect
              </Button>
            )}
          </div>
        ))}
      </div>

      <h2 className="text-lg font-semibold mb-4">
        Detected Bills{" "}
        {detected.length > 0 && (
          <span className="text-sm font-normal text-muted-foreground">
            ({detected.length} pending review)
          </span>
        )}
      </h2>
      <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
        {detected.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            No bills to review
          </div>
        ) : (
          <div className="space-y-2">
            {detected.map((det) => (
              <div
                key={det.id}
                className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-background p-4 dark:bg-muted/20"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="shrink-0 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-muted/50">
                    {det.source}
                  </span>
                  <span className="text-sm font-medium truncate">
                    {det.vendor}
                  </span>
                  <span className="text-sm font-semibold whitespace-nowrap">
                    {formatCurrency(det.amountCents, det.currency)}
                  </span>
                  {det.invoiceNumber && (
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      #{det.invoiceNumber}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    Due {det.dueDate}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      det.confidence >= 0.9
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : det.confidence >= 0.8
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {Math.round(det.confidence * 100)}% match
                  </span>
                  {det.duplicateWarning && (
                    <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-medium text-destructive">
                      Possible duplicate
                    </span>
                  )}
                  <Button size="xs" onClick={handleApprove}>
                    <Check size={12} />
                    Approve
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    onClick={() =>
                      showComingSoon("Inline editing is coming soon!")
                    }
                  >
                    Edit
                  </Button>
                  <button
                    onClick={handleDismiss}
                    className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50"
                    aria-label="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <p className="mt-4 text-xs text-muted-foreground text-center">
          Mock detected bills — real intake requires connected sources.
        </p>
      </div>

      {toastElement}
    </div>
  );
}
