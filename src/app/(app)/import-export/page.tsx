"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, Download, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function ImportExportPage() {
  const [plan] = useState<"free" | "pro">("free");
  const [csvText, setCsvText] = useState("");
  const [preview, setPreview] = useState<{
    validRows: Array<{ rowNumber: number; bill: Record<string, unknown> }>;
    errors: Array<{ rowNumber: number; field: string; message: string }>;
    warnings: Array<{ rowNumber: number; message: string }>;
  } | null>(null);

  function handlePreview() {
    const sample: typeof preview = {
      validRows: [
        {
          rowNumber: 2,
          bill: {
            name: "AWS Invoice",
            amountCents: 12050,
            currency: "USD",
            dueDate: "2026-06-15",
            cycle: "monthly",
            category: "Cloud",
            priority: "medium",
            status: "unpaid",
            tags: ["cloud", "infrastructure"],
            notes: "Production account"
          }
        }
      ],
      errors: [],
      warnings: []
    };
    setPreview(sample);
  }

  return (
    <div>
      <div>
        <h1 className="text-2xl font-semibold">Import / Export</h1>
        <p className="mt-1 text-sm text-muted">Import bills from CSV or export your data.</p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Export Bills</CardTitle>
          </CardHeader>
          <p className="mb-4 text-sm text-muted">
            Download your bill list as a CSV file.
          </p>
          <a href="/api/export/bills">
            <Button variant="secondary">
              <Download size={16} />
              Export CSV
            </Button>
          </a>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CardTitle>Import Bills</CardTitle>
              <Badge variant="warning">Pro</Badge>
            </div>
          </CardHeader>
          {plan === "free" ? (
            <>
              <p className="mb-4 text-sm text-muted">
                CSV import is available on the Pro plan. Upgrade to import bills in bulk.
              </p>
              <Link href="/pricing">
                <Button variant="secondary">
                  Upgrade to Pro
                  <ArrowRight size={14} />
                </Button>
              </Link>
            </>
          ) : (
            <>
              <textarea
                className="mb-4 h-32 w-full rounded-md border border-border bg-white p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-primary/20"
                placeholder="Paste CSV content or upload a file..."
                value={csvText}
                onChange={(e) => setCsvText(e.target.value)}
              />
              <div className="flex gap-2">
                <Button onClick={handlePreview}>
                  <Upload size={16} />
                  Preview
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      {preview && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>

          {preview.errors.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-destructive">Errors</p>
              <ul className="space-y-1">
                {preview.errors.map((err, i) => (
                  <li key={i} className="text-sm text-destructive">
                    Row {err.rowNumber}: {err.field} - {err.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preview.warnings.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-yellow-600">Warnings</p>
              <ul className="space-y-1">
                {preview.warnings.map((w, i) => (
                  <li key={i} className="text-sm text-yellow-600">
                    Row {w.rowNumber}: {w.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {preview.validRows.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-primary">
                {preview.validRows.length} valid row{preview.validRows.length !== 1 ? "s" : ""}
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-border bg-background text-xs font-medium uppercase text-muted">
                    <tr>
                      <th className="px-4 py-2">Row</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Amount</th>
                      <th className="px-4 py-2">Currency</th>
                      <th className="px-4 py-2">Due Date</th>
                      <th className="px-4 py-2">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.validRows.map((row) => {
                      const b = row.bill as Record<string, unknown>;
                      return (
                        <tr key={row.rowNumber}>
                          <td className="px-4 py-2">{row.rowNumber}</td>
                          <td className="px-4 py-2 font-medium">{String(b.name ?? "")}</td>
                          <td className="px-4 py-2">${((Number(b.amountCents) ?? 0) / 100).toFixed(2)}</td>
                          <td className="px-4 py-2">{String(b.currency ?? "")}</td>
                          <td className="px-4 py-2">{String(b.dueDate ?? "")}</td>
                          <td className="px-4 py-2">{String(b.category ?? "")}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
