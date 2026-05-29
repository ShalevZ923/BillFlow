"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import type { OccurrenceStatus, BillPriority } from "@/lib/billing/types";

export type DashboardFilterState = {
  search: string;
  status: OccurrenceStatus | null;
  category: string | null;
  tag: string | null;
  priority: BillPriority | null;
};

type DashboardFiltersProps = {
  filters: DashboardFilterState;
  categories: string[];
  tags: string[];
  onFilterChange: (filters: DashboardFilterState) => void;
};

const statusOptions: Array<{ label: string; value: OccurrenceStatus | null }> = [
  { label: "All", value: null },
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Skipped", value: "skipped" }
];

const priorityOptions: Array<{ label: string; value: BillPriority | null }> = [
  { label: "All", value: null },
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

export function DashboardFilters({ filters, categories, tags, onFilterChange }: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative w-64">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <Input
          className="pl-9"
          placeholder="Search bills..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>

      <select
        className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={filters.status ?? ""}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            status: (e.target.value || null) as OccurrenceStatus | null
          })
        }
      >
        {statusOptions.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        value={filters.priority ?? ""}
        onChange={(e) =>
          onFilterChange({
            ...filters,
            priority: (e.target.value || null) as BillPriority | null
          })
        }
      >
        {priorityOptions.map((opt) => (
          <option key={opt.label} value={opt.value ?? ""}>
            {opt.label}
          </option>
        ))}
      </select>

      {categories.length > 0 && (
        <select
          className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.category ?? ""}
          onChange={(e) =>
            onFilterChange({ ...filters, category: e.target.value || null })
          }
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      {tags.length > 0 && (
        <select
          className="h-10 rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.tag ?? ""}
          onChange={(e) =>
            onFilterChange({ ...filters, tag: e.target.value || null })
          }
        >
          <option value="">All Tags</option>
          {tags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      )}

      {(filters.search || filters.status || filters.category || filters.tag || filters.priority) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            onFilterChange({ search: "", status: null, category: null, tag: null, priority: null })
          }
        >
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  );
}
