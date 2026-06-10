"use client";

import { useMemo, useState, useCallback } from "react";
import {
  CalendarDays,
  CreditCard,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Search,
  Trash2,
  WalletCards
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { CreateBillDialog } from "@/components/bills/create-bill-dialog";
import { EditBillDialog } from "@/components/bills/edit-bill-dialog";
import type { BillListItem } from "@/components/bills/bill-list";
import type { BillData } from "@/app/(app)/bills/actions";
import { currencyOptions } from "@/lib/currency/supported";
import { cn } from "@/lib/utils";

type BillsManagementSurfaceProps = {
  bills: BillData[];
  onBillCreated: (bill: BillListItem) => void;
  onBillsChanged: () => void;
};

const statusTabs = ["All", "Overdue", "Unpaid", "Paid"] as const;

const priorityOrder: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3
};

const statusVariant: Record<string, "default" | "success" | "warning" | "destructive" | "secondary"> = {
  unpaid: "warning",
  paid: "success",
  overdue: "destructive",
  skipped: "secondary"
};

const priorityTone: Record<string, string> = {
  low: "text-muted-foreground",
  medium: "text-muted-foreground",
  high: "text-yellow-700",
  critical: "text-destructive"
};

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

function getCurrencySymbol(code: string): string {
  return currencyOptions.find((currency) => currency.code === code)?.symbol ?? code;
}

function formatCurrency(cents: number, code: string): string {
  return `${getCurrencySymbol(code)}${formatCents(cents)}`;
}

function isDueThisWeek(dueDate: string): boolean {
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);
  return due >= today && due <= sevenDaysFromNow;
}

function formatDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${date}T00:00:00`));
}

function getCategories(bills: BillData[]): string[] {
  return ["All", ...Array.from(new Set(bills.map((bill) => bill.category))).sort()];
}

function getMonthlyTotal(bills: BillData[]): number {
  return bills.reduce((total, bill) => {
    if (bill.cycle === "yearly") return total + Math.round(bill.amountCents / 12);
    if (bill.cycle === "one-time") return total;
    return total + bill.amountCents;
  }, 0);
}

export function BillsManagementSurface({
  bills,
  onBillCreated,
  onBillsChanged
}: BillsManagementSurfaceProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusTabs)[number]>("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [editingBillId, setEditingBillId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"edit" | "delete">("edit");

  const categories = useMemo(() => getCategories(bills), [bills]);

  const filteredBills = useMemo(() => {
    const query = search.trim().toLowerCase();

    return bills
      .filter((bill) => {
        if (query) {
          const haystack = [
            bill.name,
            bill.vendor,
            bill.category,
            bill.notes,
            ...bill.tags
          ]
            .join(" ")
            .toLowerCase();

          if (!haystack.includes(query)) return false;
        }

        if (statusFilter !== "All" && bill.status !== statusFilter.toLowerCase()) return false;
        if (categoryFilter !== "All" && bill.category !== categoryFilter) return false;
        if (priorityFilter !== "All" && bill.priority !== priorityFilter.toLowerCase()) return false;

        return true;
      })
      .sort((a, b) => {
        const statusA = a.status === "overdue" ? 0 : a.status === "unpaid" ? 1 : 2;
        const statusB = b.status === "overdue" ? 0 : b.status === "unpaid" ? 1 : 2;
        if (statusA !== statusB) return statusA - statusB;

        const priorityDiff = (priorityOrder[a.priority] ?? 99) - (priorityOrder[b.priority] ?? 99);
        if (priorityDiff !== 0) return priorityDiff;

        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [bills, categoryFilter, priorityFilter, search, statusFilter]);

  const selectedBill = selectedBillId
    ? bills.find((bill) => bill.id === selectedBillId) ?? null
    : null;
  const editingBill = editingBillId
    ? bills.find((bill) => bill.id === editingBillId) ?? null
    : null;

  const summary = useMemo(
    () => ({
      overdue: bills.filter((bill) => bill.status === "overdue").length,
      dueThisWeek: bills.filter((bill) => bill.status !== "paid" && isDueThisWeek(bill.dueDate)).length,
      unpaid: bills.filter((bill) => bill.status === "unpaid").length,
      monthlyTotal: getMonthlyTotal(bills)
    }),
    [bills]
  );

  const openEdit = useCallback((billId: string) => {
    setSelectedBillId(null);
    setDialogMode("edit");
    setEditingBillId(billId);
  }, []);

  const openDelete = useCallback((billId: string) => {
    setSelectedBillId(null);
    setDialogMode("delete");
    setEditingBillId(billId);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bills</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage recurring obligations, due dates, and payment state.
          </p>
        </div>
        <CreateBillDialog onBillCreated={onBillCreated} />
      </div>

      {bills.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText />
          </div>
          <h2 className="mt-4 text-base font-semibold">No bills yet</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Create your first bill to start tracking due dates, payment state, and recurring obligations.
          </p>
          <div className="mt-5 flex justify-center">
            <CreateBillDialog onBillCreated={onBillCreated} />
          </div>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile
              icon={CalendarDays}
              label="Overdue"
              value={summary.overdue.toString()}
              helper="Needs attention"
              tone={summary.overdue > 0 ? "risk" : "neutral"}
            />
            <SummaryTile
              icon={WalletCards}
              label="Due this week"
              value={summary.dueThisWeek.toString()}
              helper="Unpaid obligations"
              tone="warning"
            />
            <SummaryTile
              icon={FileText}
              label="Unpaid"
              value={summary.unpaid.toString()}
              helper="Open bills"
              tone="neutral"
            />
            <SummaryTile
              icon={CreditCard}
              label="Monthly total"
              value={formatCurrency(summary.monthlyTotal, bills[0]?.currency ?? "USD")}
              helper="Recurring estimate"
              tone="neutral"
            />
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="relative min-w-0 flex-1 lg:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  aria-label="Search bills"
                  placeholder="Search bills, vendors, categories, notes..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-border bg-background p-1">
                  {statusTabs.map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={cn(
                        "h-7 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition",
                        statusFilter === tab && "bg-card text-foreground shadow-sm"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <select
                  aria-label="Filter by category"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category === "All" ? "All categories" : category}
                    </option>
                  ))}
                </select>

                <select
                  aria-label="Filter by priority"
                  value={priorityFilter}
                  onChange={(event) => setPriorityFilter(event.target.value)}
                  className="h-9 rounded-lg border border-input bg-background px-2.5 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  {["All", "Critical", "High", "Medium", "Low"].map((priority) => (
                    <option key={priority} value={priority}>
                      {priority === "All" ? "All priorities" : priority}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[920px]">
                <div className="grid grid-cols-[minmax(260px,1.5fr)_110px_110px_130px_120px_120px_72px] border-b border-border px-4 py-2 text-xs font-medium uppercase text-muted-foreground">
                  <span>Bill</span>
                  <span>Status</span>
                  <span>Priority</span>
                  <span>Category</span>
                  <span>Amount</span>
                  <span>Due date</span>
                  <span className="text-right">Actions</span>
                </div>

                {filteredBills.length === 0 ? (
                  <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">
                    No bills match your filters.
                  </div>
                ) : (
                  <div>
                    {filteredBills.map((bill) => (
                      <div
                        key={bill.id}
                        role="button"
                        tabIndex={0}
                        aria-label={`Open ${bill.name} details`}
                        onClick={() => setSelectedBillId(bill.id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedBillId(bill.id);
                          }
                        }}
                        className={cn(
                          "grid cursor-pointer grid-cols-[minmax(260px,1.5fr)_110px_110px_130px_120px_120px_72px] items-center border-b border-border px-4 py-3 text-sm outline-none transition last:border-b-0 hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/40",
                          bill.status === "overdue" && "bg-destructive/[0.03]"
                        )}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="truncate font-medium">{bill.name}</span>
                            {bill.priority === "critical" && (
                              <span className="rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                                Critical
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex min-w-0 items-center gap-2 text-xs text-muted-foreground">
                            <span className="truncate">{bill.vendor || "No vendor"}</span>
                            <span aria-hidden="true">/</span>
                            <span className="capitalize">{bill.cycle}</span>
                          </div>
                        </div>
                        <div>
                          <Badge variant={statusVariant[bill.status] ?? "secondary"} className="capitalize">
                            {bill.status}
                          </Badge>
                        </div>
                        <span className={cn("text-xs font-semibold capitalize", priorityTone[bill.priority])}>
                          {bill.priority}
                        </span>
                        <span className="truncate text-muted-foreground">{bill.category}</span>
                        <span className="font-semibold">{formatCurrency(bill.amountCents, bill.currency)}</span>
                        <span className="text-muted-foreground">{formatDate(bill.dueDate)}</span>
                        <div className="flex justify-end" onClick={(event) => event.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
                              <MoreHorizontal />
                              <span className="sr-only">Open actions for {bill.name}</span>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" sideOffset={6}>
                              <DropdownMenuGroup>
                                <DropdownMenuItem onClick={() => setSelectedBillId(bill.id)}>
                                  <Eye />
                                  View details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openEdit(bill.id)}>
                                  <Pencil />
                                  Edit
                                </DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => openDelete(bill.id)}>
                                <Trash2 />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <BillDetailDialog
        bill={selectedBill}
        onOpenChange={(open) => {
          if (!open) setSelectedBillId(null);
        }}
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {editingBill && (
        <EditBillDialog
          bill={editingBill}
          open={!!editingBillId}
          onOpenChange={(open) => {
            if (!open) setEditingBillId(null);
          }}
          onSaved={onBillsChanged}
          onDeleted={onBillsChanged}
          initialMode={dialogMode}
        />
      )}
    </div>
  );
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  helper,
  tone
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
  helper: string;
  tone: "neutral" | "warning" | "risk";
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-lg",
            tone === "risk" && "bg-destructive/10 text-destructive",
            tone === "warning" && "bg-yellow-50 text-yellow-700",
            tone === "neutral" && "bg-primary/10 text-primary"
          )}
        >
          <Icon />
        </div>
      </div>
    </div>
  );
}

function BillDetailDialog({
  bill,
  onOpenChange,
  onEdit,
  onDelete
}: {
  bill: BillData | null;
  onOpenChange: (open: boolean) => void;
  onEdit: (billId: string) => void;
  onDelete: (billId: string) => void;
}) {
  return (
    <Dialog open={!!bill} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 p-0" overlayClassName="bg-black/40 backdrop-blur-md">
        {bill && (
          <>
            <DialogHeader className="border-b border-border px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-4 pr-8">
                <div className="min-w-0">
                  <DialogTitle className="truncate text-xl font-semibold">{bill.name}</DialogTitle>
                  <DialogDescription className="mt-1">
                    {bill.vendor || "No vendor assigned"}
                  </DialogDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant[bill.status] ?? "secondary"} className="capitalize">
                    {bill.status}
                  </Badge>
                  <Badge variant={bill.priority === "critical" ? "destructive" : "outline"} className="capitalize">
                    {bill.priority}
                  </Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-5 px-6 py-5 sm:grid-cols-2">
              <DetailItem label="Amount" value={formatCurrency(bill.amountCents, bill.currency)} />
              <DetailItem label="Due date" value={formatDate(bill.dueDate)} />
              <DetailItem label="Cycle" value={bill.cycle} />
              <DetailItem label="Category" value={bill.category} />
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Tags</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {bill.tags.length > 0 ? (
                    bill.tags.map((tag) => (
                      <Badge key={tag} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <p className="text-xs font-medium uppercase text-muted-foreground">Notes</p>
                <p className="mt-2 rounded-lg border border-border bg-background p-3 text-sm text-muted-foreground">
                  {bill.notes || "No notes added."}
                </p>
              </div>
            </div>

            <DialogFooter className="sm:justify-between">
              <Button variant="destructive" onClick={() => onDelete(bill.id)}>
                <Trash2 data-icon="inline-start" />
                Delete
              </Button>
              <div className="flex flex-col-reverse gap-2 sm:flex-row">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button onClick={() => onEdit(bill.id)}>
                  <Pencil data-icon="inline-start" />
                  Edit
                </Button>
              </div>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium capitalize">{value}</p>
    </div>
  );
}
