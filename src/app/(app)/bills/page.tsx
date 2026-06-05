"use client";

import { useState, useMemo } from "react";
import { Search, Calendar } from "lucide-react";
import { CreateBillDialog } from "@/components/bills/create-bill-dialog";
import { mockBills } from "@/lib/mock/data";
import type { OccurrenceStatus, CurrencyCode } from "@/lib/billing/types";
import { currencyOptions } from "@/lib/currency/supported";
import type { BillListItem } from "@/components/bills/bill-list";

function formatCents(c: number): string {
  return (c / 100).toFixed(2);
}

function getSymbol(code: string): string {
  return currencyOptions.find((c) => c.code === code)?.symbol ?? code;
}

function formatCurrency(c: number, code: CurrencyCode | string): string {
  return `${getSymbol(code)}${formatCents(c)}`;
}

type MockBill = (typeof mockBills)[number];

const statusTabs = ["All", "Unpaid", "Overdue", "Paid"] as const;

const statusStyles: Record<string, string> = {
  unpaid: "bg-muted text-muted-foreground dark:bg-muted/50",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  overdue: "bg-destructive/10 text-destructive",
  skipped: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
};

const priorityColors: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-muted-foreground",
  high: "text-amber-600 dark:text-amber-400",
  critical: "text-destructive"
};

export default function BillsPage() {
  const [bills, setBills] = useState<MockBill[]>(mockBills);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [priorityFilter, setPriorityFilter] = useState<string>("All");

  const categories = useMemo(
    () => ["All", ...new Set(mockBills.map((b) => b.category))],
    []
  );

  const filtered = useMemo(() => {
    return bills.filter((bill) => {
      if (search) {
        const q = search.toLowerCase();
        if (
          !bill.name.toLowerCase().includes(q) &&
          !bill.vendor.toLowerCase().includes(q)
        )
          return false;
      }
      if (statusFilter !== "All" && bill.status !== statusFilter.toLowerCase()) return false;
      if (categoryFilter !== "All" && bill.category !== categoryFilter) return false;
      if (priorityFilter !== "All" && bill.priority !== priorityFilter.toLowerCase()) return false;
      return true;
    });
  }, [bills, search, statusFilter, categoryFilter, priorityFilter]);

  function handleBillCreated(billItem: BillListItem) {
    const newBill: MockBill = {
      id: billItem.id,
      name: billItem.name,
      vendor: "",
      amountCents: billItem.amountCents,
      currency: billItem.currency as CurrencyCode,
      dueDate: billItem.dueDate,
      cycle: "monthly",
      category: billItem.category,
      priority: billItem.priority,
      status: billItem.status === "overdue" ? "unpaid" : (billItem.status as OccurrenceStatus),
      tags: billItem.tags,
      notes: "",
      source: null,
      createdAt: new Date().toISOString()
    };
    setBills((prev) => [newBill, ...prev]);
  }

  const overdueCount = bills.filter((b) => b.status === "overdue").length;
  const unpaidCount = bills.filter((b) => b.status === "unpaid").length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {bills.length} bills total —{" "}
            <span className="text-destructive font-medium">{overdueCount} overdue</span>
            ,{" "}
            <span className="text-primary font-medium">{unpaidCount} unpaid</span>
          </p>
        </div>
        <CreateBillDialog onBillCreated={handleBillCreated} />
      </div>

      {/* Search + Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search bills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-white py-2 pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:bg-card"
          />
        </div>
        {statusTabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              statusFilter === tab
                ? "bg-primary text-primary-foreground"
                : "border border-border bg-white text-muted-foreground hover:bg-muted dark:bg-card"
            }`}
          >
            {tab}
          </button>
        ))}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none dark:bg-card"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "All" ? "All Categories" : cat}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm outline-none dark:bg-card"
        >
          {["All", "Critical", "High", "Medium", "Low"].map((p) => (
            <option key={p} value={p}>
              {p === "All" ? "All Priorities" : p}
            </option>
          ))}
        </select>
      </div>

      {/* Bill Cards Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <div className="col-span-full flex h-48 items-center justify-center text-sm text-muted-foreground">
            No bills match your filters
          </div>
        ) : (
          filtered.map((bill) => (
            <div
              key={bill.id}
              className={`rounded-xl border bg-white p-4 transition hover:shadow-sm dark:bg-card ${
                bill.status === "overdue"
                  ? "border-destructive/30 bg-destructive/[0.02] dark:bg-destructive/[0.03]"
                  : "border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold truncate">{bill.name}</h3>
                    {bill.priority === "critical" && (
                      <span className="shrink-0 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                        !
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{bill.vendor}</p>
                </div>
                <span className="text-sm font-bold whitespace-nowrap">
                  {formatCurrency(bill.amountCents, bill.currency)}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${statusStyles[bill.status]}`}
                >
                  {bill.status}
                </span>
                <span className={`text-[10px] font-medium capitalize ${priorityColors[bill.priority]}`}>
                  {bill.priority}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar size={10} />
                  {bill.dueDate}
                </span>
                {bill.source && (
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground dark:bg-muted/50">
                    via {bill.source}
                  </span>
                )}
              </div>
              {bill.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {bill.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground dark:bg-muted/20"
                    >
                      {tag}
                    </span>
                  ))}
                  {bill.tags.length > 3 && (
                    <span className="text-[10px] text-muted-foreground">
                      +{bill.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
