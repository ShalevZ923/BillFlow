"use client";

import { useState, useRef, useEffect } from "react";
import { Download, Upload as UploadIcon, FileText, Check, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { currencyOptions } from "@/lib/currency/supported";
import { getBillCount } from "./actions";
import type { BillInput } from "@/lib/billing/types";

type PreviewRow = {
  rowNumber: number;
  bill: BillInput;
  status: "valid" | "warning";
  message?: string;
};

type ErrorRow = {
  rowNumber: number;
  field: string;
  message: string;
};

type ImportState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "preview"; csvText: string; validRows: PreviewRow[]; errors: ErrorRow[]; warnings: PreviewRow[] }
  | { phase: "confirming" }
  | { phase: "success"; imported: number }
  | { phase: "error"; message: string };

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(c: number, code: string): string {
  return `${getSymbol(code)}${formatCents(c)}`;
}

export default function ImportExportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importState, setImportState] = useState<ImportState>({ phase: "idle" });
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [billCount, setBillCount] = useState<number | null>(null);

  useEffect(() => {
    getBillCount().then(setBillCount);
  }, []);

  async function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    setImportState({ phase: "loading" });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/import/preview", {
        method: "POST",
        body: formData
      });

      const json = await res.json();

      if (!res.ok) {
        setImportState({ phase: "error", message: json.error ?? "Failed to preview file" });
        return;
      }

      const validRows: PreviewRow[] = json.validRows.map(
        (r: { rowNumber: number; bill: BillInput }) => ({
          rowNumber: r.rowNumber,
          bill: r.bill,
          status: "valid" as const
        })
      );

      const warnings: PreviewRow[] = (json.warnings ?? []).map(
        (w: { rowNumber: number; message: string }) => ({
          rowNumber: w.rowNumber,
          bill: {} as BillInput,
          status: "warning" as const,
          message: w.message
        })
      );

      setImportState({
        phase: "preview",
        csvText: await file.text(),
        validRows,
        errors: json.errors ?? [],
        warnings
      });
    } catch {
      setImportState({ phase: "error", message: "Network error. Please try again." });
    }
  }

  async function handleConfirm() {
    if (importState.phase !== "preview") return;

    setImportState({ ...importState, phase: "confirming" });

    try {
      const res = await fetch("/api/import/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvText: importState.csvText })
      });

      const json = await res.json();

      if (!res.ok) {
        setImportState({ phase: "error", message: json.error ?? "Import failed" });
        return;
      }

      setImportState({ phase: "success", imported: json.imported });
      setSelectedFileName(null);
    } catch {
      setImportState({ phase: "error", message: "Network error. Please try again." });
    }
  }

  function resetImport() {
    setImportState({ phase: "idle" });
    setSelectedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const preview =
    importState.phase === "preview" || importState.phase === "confirming"
      ? importState
      : null;

  const validCount = preview?.validRows.length ?? 0;
  const errorCount = preview?.errors.length ?? 0;
  const warningCount = preview?.warnings.length ?? 0;

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
                    {billCount != null ? `${billCount} bills` : "Loading..."}
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

            {importState.phase === "success" ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                  <Check size={24} className="text-green-600 dark:text-green-400" />
                </div>
                <p className="mt-3 text-sm font-medium">
                  Successfully imported {importState.imported} bill
                  {importState.imported !== 1 ? "s" : ""}
                </p>
                <Button variant="outline" size="sm" className="mt-3" onClick={resetImport}>
                  Import More
                </Button>
              </div>
            ) : importState.phase === "error" ? (
              <div className="flex flex-col items-center justify-center py-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <XCircle size={24} className="text-destructive" />
                </div>
                <p className="mt-3 text-sm text-destructive font-medium">{importState.message}</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={resetImport}>
                  Try Again
                </Button>
              </div>
            ) : (
              <>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-lg border-2 border-dashed border-border p-6 text-center mb-4 cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelected}
                    className="hidden"
                  />
                  {importState.phase === "loading" ? (
                    <div className="flex flex-col items-center">
                      <Loader2 size={24} className="text-muted-foreground animate-spin mb-2" />
                      <p className="text-sm text-muted-foreground">Parsing {selectedFileName}...</p>
                    </div>
                  ) : (
                    <>
                      <UploadIcon size={24} className="mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">
                        {selectedFileName ?? "Drop your CSV file here"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">or click to browse</p>
                      {!selectedFileName && (
                        <Button variant="outline" size="sm" className="mt-3">
                          Choose File
                        </Button>
                      )}
                      {selectedFileName && (
                        <Button variant="outline" size="sm" className="mt-3">
                          Change File
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2">Column mapping (auto-detected):</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Name", "Amount", "Currency", "Due Date", "Category", "Cycle", "Priority", "Tags", "Notes"].map((col) => (
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
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Select File
                  </Button>
                  <Button
                    size="sm"
                    disabled={!preview || importState.phase === "confirming" || preview.errors.length > 0}
                    onClick={handleConfirm}
                  >
                    {importState.phase === "confirming" ? (
                      <>
                        <Loader2 size={14} className="animate-spin mr-1" />
                        Importing...
                      </>
                    ) : (
                      "Confirm Import"
                    )}
                  </Button>
                </div>

                {preview && (
                  <div className="mt-4 rounded-lg border border-border overflow-hidden">
                    <div className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 bg-muted px-3 py-2 text-[10px] font-semibold uppercase text-muted-foreground dark:bg-muted/50">
                      <span>#</span>
                      <span>Name</span>
                      <span>Amount</span>
                      <span>Due</span>
                      <span>Category</span>
                    </div>
                    {preview.errors.map((e) => (
                      <div
                        key={`err-${e.rowNumber}`}
                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-xs items-center bg-destructive/5"
                      >
                        <span className="text-destructive">{e.rowNumber}</span>
                        <span className="truncate text-destructive">{e.field}</span>
                        <span className="text-destructive col-span-3">{e.message}</span>
                      </div>
                    ))}
                    {preview.warnings.map((w) => (
                      <div
                        key={`warn-${w.rowNumber}`}
                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-xs items-center bg-amber-50 dark:bg-amber-900/10"
                      >
                        <span className="text-muted-foreground">{w.rowNumber}</span>
                        <span className="truncate font-medium">—</span>
                        <span className="text-amber-600 dark:text-amber-400 col-span-3">{w.message}</span>
                      </div>
                    ))}
                    {preview.validRows.map((r) => (
                      <div
                        key={r.rowNumber}
                        className="grid grid-cols-[auto_1fr_auto_auto_auto] gap-2 px-3 py-1.5 text-xs items-center"
                      >
                        <span className="text-muted-foreground">{r.rowNumber}</span>
                        <span className="truncate font-medium">{r.bill.name}</span>
                        <span>
                          {formatCurrency(r.bill.amountCents, r.bill.currency)}
                        </span>
                        <span className="text-muted-foreground">{r.bill.dueDate}</span>
                        <span className="text-muted-foreground">{r.bill.category || "—"}</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-4 border-t border-border px-3 py-2 text-xs">
                      <span className="text-green-600 dark:text-green-400">
                        <Check size={12} className="inline mr-1" />
                        {validCount} valid
                      </span>
                      <span className="text-amber-600 dark:text-amber-400">
                        <AlertTriangle size={12} className="inline mr-1" />
                        {warningCount} warnings
                      </span>
                      <span className="text-destructive">
                        <AlertTriangle size={12} className="inline mr-1" />
                        {errorCount} errors
                      </span>
                    </div>
                  </div>
                )}
              </>
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
