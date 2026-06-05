"use client";

import { useState, useEffect, useCallback } from "react";
import { Mail, Shield, Globe, Users, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toast, type ToastVariant } from "@/components/ui/toast";
import { mockIntakeSources } from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";
import type { CurrencyCode } from "@/lib/billing/types";
import { getProfile, updateProfile, deleteAccount } from "./actions";
import Link from "next/link";

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: ToastVariant } | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [plan, setPlan] = useState("free");
  const [defaultCurrency, setDefaultCurrency] = useState<CurrencyCode>("USD");
  const [emailRemindersEnabled, setEmailRemindersEnabled] = useState(true);
  const [pushRemindersEnabled, setPushRemindersEnabled] = useState(false);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profile = await getProfile();
      if (profile) {
        setName(profile.name);
        setEmail(profile.email);
        setPlan(profile.plan);
        setDefaultCurrency(profile.defaultCurrency);
        setEmailRemindersEnabled(profile.emailRemindersEnabled);
        setPushRemindersEnabled(profile.pushRemindersEnabled);
      }
    } catch {
      setToast({ message: "Failed to load profile", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  async function handleSave() {
    setSaving(true);
    try {
      const result = await updateProfile({
        name,
        defaultCurrency,
        emailRemindersEnabled,
        pushRemindersEnabled
      });
      setToast({ message: result.message, variant: result.success ? "success" : "error" });
    } catch {
      setToast({ message: "Failed to save changes", variant: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirmationText !== email) return;
    setDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        window.location.href = "/";
      } else {
        setToast({ message: result.message, variant: "error" });
        setDeleting(false);
      }
    } catch {
      setToast({ message: "Failed to delete account", variant: "error" });
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">Loading...</p>
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-24 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

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
                  value={email}
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
            <Button size="sm" className="mt-4" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
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
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm">Email reminders</span>
              <button
                role="switch"
                aria-checked={emailRemindersEnabled}
                onClick={() => setEmailRemindersEnabled(!emailRemindersEnabled)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  emailRemindersEnabled ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                    emailRemindersEnabled ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </label>
            <label className="flex items-center justify-between py-2 cursor-pointer">
              <span className="text-sm">Browser push notifications</span>
              <button
                role="switch"
                aria-checked={pushRemindersEnabled}
                onClick={() => setPushRemindersEnabled(!pushRemindersEnabled)}
                className={`relative h-5 w-9 rounded-full transition-colors ${
                  pushRemindersEnabled ? "bg-primary" : "bg-border"
                }`}
              >
                <span
                  className={`block h-4 w-4 rounded-full bg-white shadow-sm transition-transform mt-0.5 ${
                    pushRemindersEnabled ? "translate-x-[18px]" : "translate-x-[2px]"
                  }`}
                />
              </button>
            </label>
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
                    {plan}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan === "pro" ? "Unlimited bills, all features." : "Up to 25 bills, basic features."}
                </p>
              </div>
              <Link href="/pricing">
                <Button>{plan === "pro" ? "Manage Plan" : "Upgrade to Pro"}</Button>
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

      {toast && (
        <Toast
          message={toast.message}
          variant={toast.variant}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
