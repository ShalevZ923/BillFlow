"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Upload, Globe, Calculator, Check, AlertTriangle } from "lucide-react";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { CategoryChart } from "@/components/dashboard/category-chart";
import { MonthlyBreakdown } from "@/components/dashboard/monthly-breakdown";
import { UpcomingList } from "@/components/dashboard/upcoming-list";
import { DashboardFilters } from "@/components/dashboard/dashboard-filters";
import { AiInsightCard } from "@/components/dashboard/ai-insight-card";
import { DashboardCurrencySelector } from "@/components/currency/dashboard-currency-selector";
import { BillList, type BillListItem } from "@/components/bills/bill-list";
import { CreateBillDialog } from "@/components/bills/create-bill-dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { OccurrenceStatus, BillPriority, CurrencyCode } from "@/lib/billing/types";
import { buildDashboardPayload } from "@/lib/dashboard/aggregate";
import type { ExchangeRates } from "@/lib/currency/conversion";
import { getDashboardData } from "./actions";
import type {
  DashboardBillData,
  DashboardOccurrenceData,
  DashboardPaymentData
} from "./actions";

function filterBillsByPeriod(bills: BillListItem[], period: string): BillListItem[] {
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const currentYear = `${now.getFullYear()}`;
  switch (period) {
    case "month":
      return bills.filter((bill) => bill.dueDate.startsWith(currentMonth));
    case "year":
      return bills.filter((bill) => bill.dueDate.startsWith(currentYear));
    default:
      return bills;
  }
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

type FilterState = {
  search: string;
  status: OccurrenceStatus | null;
  category: string | null;
  tag: string | null;
  priority: BillPriority | null;
};

const defaultRates: ExchangeRates = {
  base: "USD",
  updatedAt: new Date().toISOString(),
  rates: { USD: 1, EUR: 1, GBP: 1, ILS: 1 }
};

const statusPriority: Record<string, number> = {
  overdue: 0,
  unpaid: 1,
  paid: 2,
  skipped: 3
};

function deriveBillListItems(
  bills: DashboardBillData[],
  occurrences: DashboardOccurrenceData[]
): BillListItem[] {
  const occurrencesByBill = new Map<string, DashboardOccurrenceData[]>();
  for (const occ of occurrences) {
    const arr = occurrencesByBill.get(occ.billId) ?? [];
    arr.push(occ);
    occurrencesByBill.set(occ.billId, arr);
  }

  return bills.map((bill) => {
    const occs = occurrencesByBill.get(bill.id) ?? [];
    const sorted = [...occs].sort((a, b) => {
      const spDiff = (statusPriority[a.status] ?? 99) - (statusPriority[b.status] ?? 99);
      if (spDiff !== 0) return spDiff;
      return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime();
    });
    const primary = sorted[0];

    return {
      id: bill.id,
      name: bill.name,
      amountCents: primary?.amountCents ?? 0,
      currency: primary?.currency ?? "USD",
      dueDate: primary?.dueDate ?? new Date().toISOString().slice(0, 10),
      category: bill.category,
      priority: bill.priority as BillPriority,
      status: (primary?.status ?? "unpaid") as OccurrenceStatus,
      tags: bill.tags,
      vendor: bill.vendor ?? "",
      cycle: bill.cycle ?? "monthly",
      notes: bill.notes ?? ""
    };
  });
}

function deriveActivity(
  bills: DashboardBillData[],
  occurrences: DashboardOccurrenceData[],
  payments: DashboardPaymentData[]
) {
  const billMap = new Map(bills.map((b) => [b.id, b]));
  const occMap = new Map(occurrences.map((o) => [o.id, o]));

  const activities: Array<{
    id: string;
    action: string;
    billName: string;
    amountCents: number;
    date: string;
  }> = [];

  for (const payment of payments) {
    const occ = occMap.get(payment.occurrenceId);
    const bill = occ ? billMap.get(occ.billId) : undefined;
    activities.push({
      id: payment.id,
      action: "paid",
      billName: bill?.name ?? "Unknown",
      amountCents: payment.paidAmountCents,
      date: payment.paidDate
    });
  }

  for (const occ of occurrences) {
    if (occ.status === "overdue") {
      const bill = billMap.get(occ.billId);
      activities.push({
        id: `overdue-${occ.id}`,
        action: "overdue",
        billName: bill?.name ?? "Unknown",
        amountCents: occ.amountCents,
        date: occ.dueDate
      });
    }
  }

  return activities.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
}

const activityIcons: Record<string, React.ReactNode> = {
  paid: <Check size={14} />,
  added: <Plus size={14} />,
  imported: <Upload size={14} />,
  overdue: <AlertTriangle size={14} />
};

const activityColors: Record<string, string> = {
  paid: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  added: "bg-primary/10 text-primary",
  imported: "bg-primary/10 text-primary",
  overdue: "bg-destructive/10 text-destructive"
};

export function DashboardContent() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<{
    bills: DashboardBillData[];
    occurrences: DashboardOccurrenceData[];
    payments: DashboardPaymentData[];
    rates: ExchangeRates | null;
    userProfile: { name: string; email: string; defaultCurrency: CurrencyCode; onboardingCompleted: boolean };
  } | null>(null);

  const [searchLoading, setSearchLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [currency, setCurrency] = useState("USD");
  const [period, setPeriod] = useState("overview");
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: null,
    category: null,
    tag: null,
    priority: null
  });

  const router = useRouter();

  const fetchData = useCallback(async (searchQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardData(searchQuery);
      setRawData(data);
      setCurrency(data.userProfile.defaultCurrency);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!filters.search.trim()) {
      fetchData();
      return;
    }

    setSearchLoading(true);
    debounceRef.current = setTimeout(() => {
      fetchData(filters.search);
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search, fetchData]);

  const dashboardPayload = useMemo(() => {
    if (!rawData) return null;
    const today = new Date().toISOString().slice(0, 10);
    const rates = rawData.rates ?? defaultRates;
    return buildDashboardPayload({
      today,
      dashboardCurrency: currency as CurrencyCode,
      rates,
      bills: rawData.bills.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        priority: b.priority,
        tags: b.tags,
        cycle: b.cycle
      })),
      occurrences: rawData.occurrences.map((o) => ({
        id: o.id,
        billId: o.billId,
        dueDate: o.dueDate,
        amountCents: o.amountCents,
        currency: o.currency,
        status: o.status as OccurrenceStatus
      }))
    });
  }, [rawData, currency]);

  const billListItems = useMemo(() => {
    if (!rawData) return [];
    return deriveBillListItems(rawData.bills, rawData.occurrences);
  }, [rawData]);

  const activityItems = useMemo(() => {
    if (!rawData) return [];
    return deriveActivity(rawData.bills, rawData.occurrences, rawData.payments);
  }, [rawData]);

  const categories = useMemo(
    () => [...new Set(billListItems.map((b) => b.category))],
    [billListItems]
  );
  const tags = useMemo(
    () => [...new Set(billListItems.flatMap((b) => b.tags))],
    [billListItems]
  );

  const nonSearchFiltered = useMemo(() => {
    return billListItems.filter((bill) => {
      if (filters.status && bill.status !== filters.status) return false;
      if (filters.category && bill.category !== filters.category) return false;
      if (filters.tag && !bill.tags.includes(filters.tag)) return false;
      if (filters.priority && bill.priority !== filters.priority) return false;
      return true;
    });
  }, [billListItems, filters.status, filters.category, filters.tag, filters.priority]);

  const periodFiltered = useMemo(
    () => filterBillsByPeriod(nonSearchFiltered, period),
    [nonSearchFiltered, period]
  );

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  function handleBillCreated() {
    fetchData();
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-5 w-72" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-9 w-[100px]" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-9 w-20 rounded-md" />
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-20 rounded-md" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-80 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>

        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-40 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-center">
          <AlertTriangle size={40} className="mx-auto mb-3 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Failed to load dashboard data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={() => fetchData()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {rawData?.userProfile.name.split(" ")[0] ?? "User"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <CreateBillDialog onBillCreated={handleBillCreated} />
          <DashboardCurrencySelector value={currency} onChange={setCurrency} />
        </div>
      </div>

      {/* Period Tabs */}
      <Tabs value={period} onValueChange={setPeriod} className="mb-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Summary Cards */}
      <SummaryCards
        monthlyObligationsCents={dashboardPayload?.summary.monthlyObligationsCents ?? 0}
        yearlyProjectionCents={dashboardPayload?.summary.yearlyProjectionCents ?? 0}
        pendingCount={dashboardPayload?.summary.pendingCount ?? 0}
        pendingAmountCents={dashboardPayload?.summary.pendingAmountCents ?? 0}
        overdueCount={dashboardPayload?.summary.overdueCount ?? 0}
        overdueAmountCents={dashboardPayload?.summary.overdueAmountCents ?? 0}
      />

      {/* Charts + Upcoming + Quick Actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MonthlyBreakdown
            monthlyBreakdown={dashboardPayload?.monthlyBreakdown ?? []}
          />
          <CategoryChart
            categoryTotals={dashboardPayload?.categoryTotals ?? []}
          />
        </div>

        <div className="space-y-6">
          <UpcomingList items={dashboardPayload?.upcoming30Days ?? []} />

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Plus, label: "Add Bill", href: "/bills" },
                { icon: Upload, label: "Import", href: "/import-export" },
                { icon: Globe, label: "Convert", href: "/currency" },
                { icon: Calculator, label: "Calculate", href: "/calculator" }
              ].map((action) => (
                <button
                  key={action.label}
                  onClick={() => router.push(action.href)}
                  className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background p-3 text-xs font-medium transition hover:bg-muted hover:border-primary/30 dark:bg-muted/20"
                >
                  <action.icon size={16} className="text-primary" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          <AiInsightCard plan="free" />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mt-6 rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
        <h3 className="text-sm font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-1">
          {activityItems.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No recent activity
            </p>
          ) : (
            activityItems.map((act) => (
              <div
                key={act.id}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted/50"
              >
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activityColors[act.action] ?? "bg-muted text-muted-foreground"}`}
                >
                  {activityIcons[act.action] ?? <Check size={14} />}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{act.billName}</span>
                  <span className="text-muted-foreground">
                    {" "}
                    was {act.action}
                    {act.amountCents > 0 && ` — ${formatCurrency(act.amountCents)}`}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">{act.date}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Bill List */}
      <div className="mt-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">All Bills</h2>
        </div>
        <DashboardFilters
          filters={filters}
          categories={categories}
          tags={tags}
          onFilterChange={setFilters}
          searchLoading={searchLoading}
        />
        <div className="mt-4">
          <BillList
            bills={periodFiltered}
            searchQuery={filters.search}
            emptyStateText="Add your first bill to turn the dashboard into a useful financial picture."
            onChange={fetchData}
          />
        </div>
      </div>
    </div>
  );
}
