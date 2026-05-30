"use client";

import { useState } from "react";
import { Download, Upload as UploadIcon, FileText, Check, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { mockBills } from "@/lib/mock/data";
import { currencyOptions } from "@/lib/currency/supported";

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(c: number, code: string): string {
  return `${getSymbol(code)}${formatCents(c)}`;
}

const samplePreview = {
  rows: [
    { row: 1, name: "AWS Invoice", amountCents: 12050, currency: "USD", dueDate: "2026-06-15", category: "Cloud", status: "valid" as const },
    { row: 2, name: "Office Rent", amountCents: 280000, currency: "USD", dueDate: "2026-06-01", category: "Rent", status: "valid" as const },
    { row: 3, name: "Invalid Bill", amountCents: 0, currency: "XXX", dueDate: "invalid", category: "", status: "error" as const, error: "Unsupported currency: XXX" },
    { row: 4, name: "Duplicate Bill", amountCents: 12050, currency: "USD", dueDate: "2026-06-15", category: "Cloud", status: "warning" as const, warning: "Possible duplicate of AWS Invoice" }
  ],
  validCount: 2,
  errorCount: 1,
  warningCount: 1
};

export default function ImportExportPage() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Import & Export</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Import bills from files or export your data for analysis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download size={18} className="text-primary" />
              <CardTitle>Export Bills</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download your bills as a CSV file. You can filter by date range,
              category, status, and priority before exporting.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {["All", "This Month", "This Year", "Custom"].map((range) => (
                <button
                  key={range}
                  className={`rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-muted dark:hover:bg-muted/20 ${
                    range === "All" ? "bg-primary text-primary-foreground border-primary" : "bg-white dark:bg-card"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-3 dark:bg-muted/20">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">bills-export.csv</p>
                  <p className="text-xs text-muted-foreground">
                    {mockBills.length} bills
                  </p>
                </div>
              </div>
              <Button size="sm">
                <Download size={14} />
                Export CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Import */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <UploadIcon size={18} className="text-primary" />
              <CardTitle>Import Bills</CardTitle>
              <Badge>Pro</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a CSV file to bulk-import bills. The system will validate
              each row before importing.
            </p>

            <div className="rounded-lg border-2 border-dashed border-border p-6 text-center mb-4">
              <UploadIcon size={24} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-sm font-medium">Drop your CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
              <Button variant="outline" size="sm" className="mt-3">
                Choose File
              </Button>
            </div>

            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Column mapping (auto-detected):</p>
              <div className="flex flex-wrap gap-1.5">
                {["Name", "Amount", "Currency", "Due Date", "Category"].map((col) => (
                  <span
                    key={col}
                    className="rounded bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:bg-green-900/20 dark:text-green-400"
                  >
                    <Check size={10} className="inline mr-1" />
                    {col}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                Show Preview
              </Button>
              <Button size="sm" disabled>
                Confirm Import
              </Button>
            </div>

            {showPreview && (
              <div className="mt-4 rounded-lg border border-border overflow-hidden">
                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 bg-muted px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground dark:bg-muted/50">
                  <span>#</span>
                  <span>Name</span>
                  <span>Amount</span>
                  <span>Due</span>
                  <span>Category</span>
                </div>
                {samplePreview.rows.map((r) => (
                  <div
                    key={r.row}
                    className={`grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-xs items-center ${
                      r.status === "error"
                        ? "bg-destructive/5"
                        : r.status === "warning"
                          ? "bg-amber-50 dark:bg-amber-900/10"
                          : ""
                    }`}
                  >
                    <span className="text-muted-foreground">{r.row}</span>
                    <span className="truncate font-medium">{r.name}</span>
                    <span>
                      {r.amountCents > 0 ? formatCurrency(r.amountCents, r.currency) : "—"}
                    </span>
                    <span className="text-muted-foreground">{r.dueDate}</span>
                    <span className="text-muted-foreground">{r.category || "—"}</span>
                  </div>
                ))}
                <div className="flex items-center gap-4 border-t border-border px-3 py-2 text-xs">
                  <span className="text-green-600 dark:text-green-400">
                    <Check size={12} className="inline mr-1" />
                    {samplePreview.validCount} valid
                  </span>
                  <span className="text-amber-600 dark:text-amber-400">
                    <AlertTriangle size={12} className="inline mr-1" />
                    {samplePreview.warningCount} warnings
                  </span>
                  <span className="text-destructive">
                    <AlertTriangle size={12} className="inline mr-1" />
                    {samplePreview.errorCount} errors
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pro Upsell */}
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <div className="flex items-center gap-2">
            <UploadIcon size={18} className="text-primary" />
            <CardTitle>CSV Import</CardTitle>
            <Badge>Pro</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex items-center justify-between flex-wrap gap-4">
          <p className="text-sm text-muted-foreground max-w-md">
            CSV import is available on the Pro plan. Upgrade to import bills in
            bulk with validation, duplicate detection, and column mapping.
          </p>
          <Link href="/pricing">
            <Button>Upgrade to Pro</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
