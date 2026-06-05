"use client";

import { useState, useMemo } from "react";
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
import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";
import {
  mockBills,
  mockCategoryTotals,
  mockMonthlyBreakdown,
  mockUpcomingItems,
  mockDashboardSummary,
  mockActivityFeed,
  mockUserProfile
} from "@/lib/mock/data";

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

const mockBillListItems: BillListItem[] = mockBills.map((b) => ({
  id: b.id,
  name: b.name,
  amountCents: b.amountCents,
  currency: b.currency,
  dueDate: b.dueDate,
  category: b.category,
  priority: b.priority,
  status: b.status,
  tags: b.tags
}));

const upcomingData = mockUpcomingItems.map((item) => ({
  id: item.id,
  billId: item.billId,
  name: item.name,
  dueDate: item.dueDate,
  amountCents: item.amountCents,
  status: item.status,
  daysUntilDue: item.daysUntilDue
}));

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

export default function DashboardPage() {
  const [currency, setCurrency] = useState("USD");
  const [period, setPeriod] = useState("overview");
  const [bills, setBills] = useState<BillListItem[]>(mockBillListItems);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    status: null,
    category: null,
    tag: null,
    priority: null
  });

  const categories = [...new Set(bills.map((b) => b.category))];
  const tags = [...new Set(bills.flatMap((b) => b.tags))];

  const nonSearchFiltered = useMemo(() => {
    return bills.filter((bill) => {
      if (filters.status && bill.status !== filters.status) return false;
      if (filters.category && bill.category !== filters.category) return false;
      if (filters.tag && !bill.tags.includes(filters.tag)) return false;
      if (filters.priority && bill.priority !== filters.priority) return false;
      return true;
    });
  }, [bills, filters.status, filters.category, filters.tag, filters.priority]);

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

  function handleBillCreated(bill: BillListItem) {
    setBills((prev) => [bill, ...prev]);
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {mockUserProfile.name.split(" ")[0]}
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
          monthlyObligationsCents={mockDashboardSummary.monthlyObligationsCents}
          yearlyProjectionCents={mockDashboardSummary.yearlyProjectionCents}
          pendingCount={mockDashboardSummary.pendingCount}
          pendingAmountCents={mockDashboardSummary.pendingAmountCents}
          overdueCount={mockDashboardSummary.overdueCount}
          overdueAmountCents={mockDashboardSummary.overdueAmountCents}
        />
      

      {/* Charts + Upcoming + Quick Actions */}
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <MonthlyBreakdown monthlyBreakdown={mockMonthlyBreakdown} />
          <CategoryChart categoryTotals={mockCategoryTotals} />
        </div>

        <div className="space-y-6">
          <UpcomingList items={upcomingData} />

          {/* Quick Actions */}
          <div className="rounded-xl border border-border bg-white p-5 shadow-sm dark:bg-card">
            <h3 className="text-sm font-semibold mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Plus, label: "Add Bill" },
                { icon: Upload, label: "Import" },
                { icon: Globe, label: "Convert" },
                { icon: Calculator, label: "Calculate" }
              ].map((action) => (
                <button
                  key={action.label}
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
          {mockActivityFeed.map((act) => (
            <div
              key={act.id}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition hover:bg-muted/50"
            >
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${activityColors[act.action]}`}
              >
                {activityIcons[act.action]}
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
          ))}
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
        />
        <div className="mt-4">
          <BillList
            bills={periodFiltered}
            searchQuery={filters.search}
            emptyStateText="Add your first bill to turn the dashboard into a useful financial picture."
          />
        </div>
      </div>
    </div>
  );
}
