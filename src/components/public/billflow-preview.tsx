import { Bell, CalendarDays, CheckCircle2, ChevronRight, CircleDollarSign, Inbox, UploadCloud } from "lucide-react";
import { cn } from "@/lib/utils";

type BillflowPreviewProps = {
  compact?: boolean;
  className?: string;
};

const dueRows = [
  {
    status: "Overdue",
    bill: "Google Workspace",
    vendor: "Google",
    due: "May 28",
    amount: "$72.00",
    tone: "risk"
  },
  {
    status: "Due today",
    bill: "Office Rent",
    vendor: "Waterfront",
    due: "Today",
    amount: "$2,800.00",
    tone: "warning"
  },
  {
    status: "Upcoming",
    bill: "GitHub Enterprise",
    vendor: "GitHub",
    due: "Jun 12",
    amount: "$105.00",
    tone: "neutral"
  }
];

const actions = [
  "2 overdue bills need attention",
  "3 bills due this week",
  "Review 1 upcoming renewal"
];

function statusClass(tone: string) {
  if (tone === "risk") return "bg-destructive/10 text-destructive";
  if (tone === "warning") return "bg-yellow-50 text-yellow-700";
  return "bg-muted text-muted-foreground";
}

export function BillflowPreview({ compact = false, className }: BillflowPreviewProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
        compact ? "p-4" : "p-4 sm:p-5",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border pb-4">
        <div>
          <p className="text-xs text-muted-foreground">Good morning</p>
          <p className="mt-1 text-base font-semibold">Here is what needs attention.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-md border border-border bg-background px-2 py-1 text-xs font-medium">USD</span>
          <span className="relative flex size-8 items-center justify-center rounded-md border border-border bg-background text-muted-foreground">
            <Bell />
            <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-destructive-foreground">
              2
            </span>
          </span>
        </div>
      </div>

      <div className={cn("grid gap-3 py-4", compact ? "grid-cols-1" : "sm:grid-cols-3")}>
        <Metric label="Due this week" value="$3,124" helper="5 bills" icon={CalendarDays} />
        <Metric label="Overdue" value="$392" helper="2 bills" icon={Bell} tone="risk" />
        <Metric label="Paid MTD" value="$2,890" helper="7 payments" icon={CheckCircle2} tone="success" />
      </div>

      <div className="rounded-lg border border-border bg-background">
        <div className="flex items-center justify-between border-b border-border px-3 py-2">
          <div>
            <p className="text-sm font-semibold">Due queue</p>
            <p className="text-xs text-muted-foreground">Overdue, due today, and upcoming bills</p>
          </div>
          <button className="rounded-md border border-border px-2 py-1 text-xs font-medium">View all</button>
        </div>
        <div className="divide-y divide-border">
          {dueRows.map((row) => (
            <div key={row.bill} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 px-3 py-2 text-sm">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-semibold", statusClass(row.tone))}>
                    {row.status}
                  </span>
                  <span className="truncate font-medium">{row.bill}</span>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {row.vendor} / {row.due}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{row.amount}</p>
                <button className="mt-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground">
                  Pay
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!compact ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_150px]">
          <div className="rounded-lg border border-border bg-background p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Spending trend</p>
              <CircleDollarSign className="text-primary" />
            </div>
            <div className="mt-4 flex h-20 items-end gap-2">
              {[32, 46, 38, 58, 52, 74].map((height, index) => (
                <span key={index} className="flex-1 rounded-t bg-primary/20" style={{ height: `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-sm font-semibold">Next actions</p>
            <div className="mt-3 flex flex-col gap-2">
              {actions.map((action) => (
                <div key={action} className="flex items-center justify-between gap-2 text-xs">
                  <span className="truncate text-muted-foreground">{action}</span>
                  <ChevronRight className="shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-background p-3">
            <p className="text-sm font-semibold">Import-ready</p>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <UploadCloud className="text-primary" />
              CSV, email, PDF
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
              <Inbox className="text-primary" />
              Unified inbox
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  helper,
  icon: Icon,
  tone = "neutral"
}: {
  label: string;
  value: string;
  helper: string;
  icon: typeof CalendarDays;
  tone?: "neutral" | "risk" | "success";
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className={cn("mt-1 text-lg font-semibold", tone === "risk" && "text-destructive", tone === "success" && "text-primary")}>
            {value}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{helper}</p>
        </div>
        <Icon className={cn("text-muted-foreground", tone === "risk" && "text-destructive", tone === "success" && "text-primary")} />
      </div>
    </div>
  );
}
