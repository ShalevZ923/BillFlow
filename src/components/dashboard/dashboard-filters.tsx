"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const statusOptions: Array<{ label: string; value: OccurrenceStatus }> = [
  { label: "Unpaid", value: "unpaid" },
  { label: "Paid", value: "paid" },
  { label: "Overdue", value: "overdue" },
  { label: "Skipped", value: "skipped" }
];

const priorityOptions: Array<{ label: string; value: BillPriority }> = [
  { label: "Critical", value: "critical" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" }
];

export function DashboardFilters({ filters, categories, tags, onFilterChange }: DashboardFiltersProps) {
  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.tag ? 1 : 0) +
    (filters.priority ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeCount > 0 && (
        <Badge variant="outline" className="gap-1.5 px-2 py-1 text-xs text-muted-foreground">
          <Filter size={12} />
          {activeCount} active
        </Badge>
      )}
      <div className="relative w-64">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search bills..."
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
        />
      </div>

      <Select
        value={filters.status ?? "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            status: value === "all" ? null : (value as OccurrenceStatus)
          })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          {statusOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority ?? "all"}
        onValueChange={(value) =>
          onFilterChange({
            ...filters,
            priority: value === "all" ? null : (value as BillPriority)
          })
        }
      >
        <SelectTrigger className="w-[130px]">
          <SelectValue placeholder="Priority" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Priority</SelectItem>
          {priorityOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {categories.length > 0 && (
        <Select
          value={filters.category ?? "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, category: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {tags.length > 0 && (
        <Select
          value={filters.tag ?? "all"}
          onValueChange={(value) =>
            onFilterChange({ ...filters, tag: value === "all" ? null : value })
          }
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {tags.map((tag) => (
              <SelectItem key={tag} value={tag}>
                {tag}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
