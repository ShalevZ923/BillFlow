"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { CreateBillDialog } from "@/components/bills/create-bill-dialog";
import type { BillListItem } from "@/components/bills/bill-list";
import { DashboardCurrencySelector } from "@/components/currency/dashboard-currency-selector";
import { DashboardModuleLayout } from "@/components/dashboard/modules/dashboard-module-layout";
import type { DashboardActivityItem } from "@/components/dashboard/modules/types";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BillPriority, CurrencyCode, OccurrenceStatus } from "@/lib/billing/types";
import { deriveBillStatus, selectPrimaryOccurrence } from "@/lib/billing/status";
import type { ExchangeRates } from "@/lib/currency/conversion";
import { buildDashboardPayload } from "@/lib/dashboard/aggregate";
import {
  filterBillItemsByPeriod,
  filterDashboardDataByPeriod,
  isDateInDashboardPeriod,
  type DashboardPeriod
} from "@/lib/dashboard/period";
import { getDashboardData } from "./actions";
import type {
  DashboardBillData,
  DashboardData,
  DashboardOccurrenceData,
  DashboardPaymentData
} from "./actions";

const defaultRates: ExchangeRates = {
  base: "USD",
  updatedAt: new Date().toISOString(),
  rates: { USD: 1, EUR: 1, GBP: 1, ILS: 1 }
};

function deriveBillListItems(
  bills: DashboardBillData[],
  occurrences: DashboardOccurrenceData[],
  today: string
): BillListItem[] {
  const occurrencesByBill = new Map<string, DashboardOccurrenceData[]>();

  for (const occurrence of occurrences) {
    const billOccurrences = occurrencesByBill.get(occurrence.billId) ?? [];
    billOccurrences.push(occurrence);
    occurrencesByBill.set(occurrence.billId, billOccurrences);
  }

  return bills.map((bill) => {
    const typedOccurrences = (occurrencesByBill.get(bill.id) ?? []).map((occurrence) => ({
      ...occurrence,
      status: occurrence.status as OccurrenceStatus
    }));
    const primary = selectPrimaryOccurrence(typedOccurrences, today);

    return {
      id: bill.id,
      name: bill.name,
      amountCents: primary?.amountCents ?? 0,
      currency: primary?.currency ?? "USD",
      dueDate: primary?.dueDate ?? today,
      category: bill.category,
      priority: bill.priority as BillPriority,
      status: deriveBillStatus(typedOccurrences, today),
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
): DashboardActivityItem[] {
  const billMap = new Map(bills.map((bill) => [bill.id, bill]));
  const occurrenceMap = new Map(occurrences.map((occurrence) => [occurrence.id, occurrence]));
  const activities: DashboardActivityItem[] = [];

  for (const payment of payments) {
    const occurrence = occurrenceMap.get(payment.occurrenceId);
    const bill = occurrence ? billMap.get(occurrence.billId) : undefined;

    activities.push({
      id: payment.id,
      action: "paid",
      billName: bill?.name ?? "Unknown bill",
      amountCents: payment.paidAmountCents,
      date: payment.paidDate
    });
  }

  for (const occurrence of occurrences) {
    if (occurrence.status !== "overdue") continue;

    const bill = billMap.get(occurrence.billId);
    activities.push({
      id: `overdue-${occurrence.id}`,
      action: "overdue",
      billName: bill?.name ?? "Unknown bill",
      amountCents: occurrence.amountCents,
      date: occurrence.dueDate
    });
  }

  return activities.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
}

function DashboardLoadingState() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Skeleton className="h-8 w-56" />
          <Skeleton className="mt-2 h-5 w-72" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-32" />
        </div>
      </div>
      <Skeleton className="h-9 w-72" />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Skeleton key={item} className="h-28 rounded-lg" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Skeleton className="h-96 rounded-lg" />
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardContent() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rawData, setRawData] = useState<DashboardData | null>(null);
  const [currency, setCurrency] = useState<CurrencyCode>("USD");
  const [period, setPeriod] = useState<DashboardPeriod>("overview");

  const applyDashboardData = useCallback((data: DashboardData) => {
    setRawData(data);
    setCurrency(data.userProfile.defaultCurrency);
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getDashboardData();
      applyDashboardData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [applyDashboardData]);

  useEffect(() => {
    let cancelled = false;

    void getDashboardData()
      .then((data) => {
        if (!cancelled) {
          applyDashboardData(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [applyDashboardData]);

  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const todayLabel = useMemo(
    () =>
      new Date().toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
      }),
    []
  );

  const billListItems = useMemo(() => {
    if (!rawData) return [];
    return deriveBillListItems(rawData.bills, rawData.occurrences, todayIso);
  }, [rawData, todayIso]);

  const periodBills = useMemo(
    () => filterBillItemsByPeriod(billListItems, period, todayIso),
    [billListItems, period, todayIso]
  );

  const dashboardPayload = useMemo(() => {
    if (!rawData) return null;

    const rates = rawData.rates ?? defaultRates;
    const bills = rawData.bills.map((bill) => ({
      id: bill.id,
      name: bill.name,
      vendor: bill.vendor,
      category: bill.category,
      priority: bill.priority as BillPriority,
      tags: bill.tags,
      cycle: bill.cycle
    }));
    const occurrences = rawData.occurrences.map((occurrence) => ({
      id: occurrence.id,
      billId: occurrence.billId,
      dueDate: occurrence.dueDate,
      amountCents: occurrence.amountCents,
      currency: occurrence.currency,
      status: occurrence.status as OccurrenceStatus
    }));
    const periodData = filterDashboardDataByPeriod({
      bills,
      occurrences,
      period,
      today: todayIso
    });
    const payments = rawData.payments
      .filter((payment) => isDateInDashboardPeriod(payment.paidDate, period, todayIso))
      .map((payment) => ({
        id: payment.id,
        paidAmountCents: payment.paidAmountCents,
        paidCurrency: payment.paidCurrency as CurrencyCode,
        paidDate: payment.paidDate
      }));

    return buildDashboardPayload({
      today: todayIso,
      dashboardCurrency: currency,
      rates,
      bills: periodData.bills,
      occurrences: periodData.occurrences,
      payments
    });
  }, [currency, period, rawData, todayIso]);

  const activityItems = useMemo(() => {
    if (!rawData) return [];

    return deriveActivity(
      rawData.bills,
      rawData.occurrences.filter((occurrence) => isDateInDashboardPeriod(occurrence.dueDate, period, todayIso)),
      rawData.payments.filter((payment) => isDateInDashboardPeriod(payment.paidDate, period, todayIso))
    );
  }, [period, rawData, todayIso]);

  const moduleContext = useMemo(() => {
    if (!dashboardPayload) return null;

    return {
      payload: dashboardPayload,
      bills: periodBills,
      activityItems,
      currency,
      onNavigate: (href: string) => router.push(href),
      onOpenBill: (billId: string) => router.push(`/bills?bill=${encodeURIComponent(billId)}`),
      onRefresh: fetchData
    };
  }, [activityItems, currency, dashboardPayload, fetchData, periodBills, router]);

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-3 text-destructive" />
          <p className="text-lg font-semibold text-destructive">Failed to load dashboard data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          Retry
        </Button>
      </div>
    );
  }

  if (!rawData || !moduleContext) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {rawData.userProfile.name.split(" ")[0] || "User"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{todayLabel}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CreateBillDialog onBillCreated={fetchData} />
          <DashboardCurrencySelector value={currency} onChange={(value) => setCurrency(value as CurrencyCode)} />
        </div>
      </div>

      <Tabs value={period} onValueChange={(value) => setPeriod(value as DashboardPeriod)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="month">This Month</TabsTrigger>
          <TabsTrigger value="year">This Year</TabsTrigger>
        </TabsList>
      </Tabs>

      <DashboardModuleLayout context={moduleContext} />
    </div>
  );
}
