"use client";

import { useState, useMemo } from "react";
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
import { Skeleton } from "@/components/ui/skeleton";
import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";

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

const mockBills: BillListItem[] = [
  {
    id: "bill-1",
    name: "AWS Invoice",
    amountCents: 12050,
    currency: "USD",
    dueDate: "2026-06-15",
    category: "Cloud",
    priority: "medium",
    status: "unpaid",
    tags: ["cloud", "infrastructure"]
  },
  {
    id: "bill-2",
    name: "Office Rent",
    amountCents: 280000,
    currency: "USD",
    dueDate: "2026-06-01",
    category: "Rent",
    priority: "critical",
    status: "unpaid",
    tags: ["office"]
  },
  {
    id: "bill-3",
    name: "GitHub Teams",
    amountCents: 8400,
    currency: "USD",
    dueDate: "2026-05-01",
    category: "SaaS",
    priority: "medium",
    status: "overdue",
    tags: ["dev"]
  },
  {
    id: "bill-4",
    name: "Adobe Creative Cloud",
    amountCents: 5999,
    currency: "USD",
    dueDate: "2026-04-15",
    category: "SaaS",
    priority: "low",
    status: "paid",
    tags: ["design"]
  }
];

const categoryTotals = [
  { category: "Rent", amountCents: 280000 },
  { category: "Cloud", amountCents: 12050 },
  { category: "SaaS", amountCents: 14399 }
];

const monthlyBreakdown = [
  { month: "2026-04", amountCents: 5999 },
  { month: "2026-05", amountCents: 8400 },
  { month: "2026-06", amountCents: 292050 },
  { month: "2026-07", amountCents: 292050 },
  { month: "2026-08", amountCents: 292050 }
];

const upcomingItems = [
  {
    id: "occ-1",
    billId: "bill-2",
    name: "Office Rent",
    dueDate: "2026-06-01",
    amountCents: 280000,
    status: "unpaid" as OccurrenceStatus,
    daysUntilDue: 3
  },
  {
    id: "occ-2",
    billId: "bill-1",
    name: "AWS Invoice",
    dueDate: "2026-06-15",
    amountCents: 12050,
    status: "unpaid" as OccurrenceStatus,
    daysUntilDue: 17
  }
];

type FilterState = {
  search: string;
  status: OccurrenceStatus | null;
  category: string | null;
  tag: string | null;
  priority: BillPriority | null;
};

export default function DashboardPage() {
  const [currency, setCurrency] = useState("USD");
  const [period, setPeriod] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<BillListItem[]>(mockBills);
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
  }, [filters.status, filters.category, filters.tag, filters.priority]);

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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex items-center gap-3">
          <CreateBillDialog onBillCreated={handleBillCreated} />
          <DashboardCurrencySelector value={currency} onChange={setCurrency} />
        </div>
      </div>

      <Tabs value={period} onValueChange={setPeriod} className="mt-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-[88px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <SummaryCards
            monthlyObligationsCents={292050}
            yearlyProjectionCents={3504600}
            pendingCount={2}
            pendingAmountCents={292050}
            overdueCount={1}
            overdueAmountCents={8400}
          />
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <CategoryChart categoryTotals={categoryTotals} />
        <MonthlyBreakdown monthlyBreakdown={monthlyBreakdown} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <UpcomingList items={upcomingItems} />
        </div>
        <AiInsightCard plan="free" />
      </div>

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
