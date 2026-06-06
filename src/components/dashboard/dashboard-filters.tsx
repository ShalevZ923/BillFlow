"use client";

import { memo, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, Filter, Loader2 } from "lucide-react";
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
  searchLoading?: boolean;
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

const CLEAR_FILTERS: DashboardFilterState = { search: "", status: null, category: null, tag: null, priority: null };

export const DashboardFilters = memo(function DashboardFilters({ filters, categories, tags, onFilterChange, searchLoading }: DashboardFiltersProps) {
  const activeCount =
    (filters.search ? 1 : 0) +
    (filters.status ? 1 : 0) +
    (filters.category ? 1 : 0) +
    (filters.tag ? 1 : 0) +
    (filters.priority ? 1 : 0);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onFilterChange({ ...filters, search: e.target.value }),
    [filters, onFilterChange]
  );

  const handleStatusChange = useCallback(
    (value: string | null) =>
      onFilterChange({ ...filters, status: value === "all" || value === null ? null : value as OccurrenceStatus }),
    [filters, onFilterChange]
  );

  const handlePriorityChange = useCallback(
    (value: string | null) =>
      onFilterChange({ ...filters, priority: value === "all" || value === null ? null : value as BillPriority }),
    [filters, onFilterChange]
  );

  const handleCategoryChange = useCallback(
    (value: string | null) =>
      onFilterChange({ ...filters, category: value === "all" || value === null ? null : value }),
    [filters, onFilterChange]
  );

  const handleTagChange = useCallback(
    (value: string | null) =>
      onFilterChange({ ...filters, tag: value === "all" || value === null ? null : value }),
    [filters, onFilterChange]
  );

  const handleClear = useCallback(() => onFilterChange(CLEAR_FILTERS), [onFilterChange]);

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
          className="pl-9 pr-9"
          placeholder="Search bills..."
          value={filters.search}
          onChange={handleSearchChange}
        />
        {searchLoading && (
          <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      <Select value={filters.status ?? "all"} onValueChange={handleStatusChange}>
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

      <Select value={filters.priority ?? "all"} onValueChange={handlePriorityChange}>
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
        <Select value={filters.category ?? "all"} onValueChange={handleCategoryChange}>
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
        <Select value={filters.tag ?? "all"} onValueChange={handleTagChange}>
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
        <Button variant="ghost" size="sm" onClick={handleClear}>
          <X size={14} />
          Clear
        </Button>
      )}
    </div>
  );
});
