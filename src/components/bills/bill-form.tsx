"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { billingCycles, billPriorities } from "@/lib/billing/types";
import { currencyOptions } from "@/lib/currency/supported";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import type { BillingCycle, BillPriority } from "@/lib/billing/types";

type BillFormValues = {
  name: string;
  vendor: string;
  amount: string;
  currency: string;
  dueDate: string;
  cycle: BillingCycle;
  customCycleDays?: string;
  category: string;
  priority: BillPriority;
  status: "unpaid" | "paid" | "skipped";
  tags: string;
  notes: string;
};

type BillFormProps = {
  onSubmit: (data: BillFormValues) => void;
  isSubmitting?: boolean;
  defaultValues?: Partial<BillFormValues>;
  submitLabel?: string;
};

const formSchema = z.object({
  name: z.string().min(1, "Bill name is required").max(120),
  vendor: z.string().max(200),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
  currency: z.string(),
  dueDate: z.string().min(1, "Due date is required"),
  cycle: z.enum(billingCycles),
  customCycleDays: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(billPriorities),
  status: z.enum(["unpaid", "paid", "skipped"]),
  tags: z.string(),
  notes: z.string().max(2000)
});

export function BillForm({ onSubmit, isSubmitting, defaultValues, submitLabel }: BillFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    control
  } = useForm<BillFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      vendor: "",
      amount: "",
      currency: "USD",
      dueDate: "",
      cycle: "monthly",
      category: "Other",
      priority: "medium",
      status: "unpaid",
      tags: "",
      notes: "",
      ...defaultValues
    }
  });

  const cycle = useWatch({ control, name: "cycle" }) as BillingCycle;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="name">
            Bill name *
          </label>
          <Input
            id="name"
            placeholder="e.g. AWS Invoice"
            {...register("name")}
          />
          {errors.name && <p className="mt-1 text-sm text-destructive">{errors.name.message}</p>}
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="vendor">
            Vendor
          </label>
          <Input
            id="vendor"
            placeholder="e.g. Amazon Web Services"
            {...register("vendor")}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="amount">
            Amount *
          </label>
          <Input
            id="amount"
            placeholder="120.50"
            {...register("amount")}
          />
          {errors.amount && <p className="mt-1 text-sm text-destructive">{errors.amount.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="currency">
            Currency
          </label>
          <select
            id="currency"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            {...register("currency")}
          >
            {currencyOptions.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code} ({c.symbol})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="dueDate">
            Due date *
          </label>
          <Input
            id="dueDate"
            type="date"
            {...register("dueDate")}
          />
          {errors.dueDate && <p className="mt-1 text-sm text-destructive">{errors.dueDate.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="cycle">
            Billing cycle
          </label>
          <select
            id="cycle"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            {...register("cycle")}
          >
            <option value="one-time">One-time</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {cycle === "custom" && (
          <div>
            <label className="mb-1.5 block text-sm font-medium" htmlFor="customCycleDays">
              Custom cycle (days)
            </label>
            <Input
              id="customCycleDays"
              type="number"
              placeholder="30"
              {...register("customCycleDays")}
            />
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="category">
            Category
          </label>
          <Input
            id="category"
            placeholder="Cloud"
            {...register("category")}
          />
          {errors.category && <p className="mt-1 text-sm text-destructive">{errors.category.message}</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="priority">
            Priority
          </label>
          <select
            id="priority"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            {...register("priority")}
          >
            {billPriorities.map((p) => (
              <option key={p} value={p}>
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="status">
            Status
          </label>
          <select
            id="status"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            {...register("status")}
          >
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="skipped">Skipped</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="tags">
            Tags
          </label>
          <Input
            id="tags"
            placeholder="cloud, infrastructure (comma-separated)"
            {...register("tags")}
          />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            rows={3}
            className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20"
            placeholder="Optional notes"
            {...register("notes")}
          />
          {errors.notes && <p className="mt-1 text-sm text-destructive">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Plus size={16} />
          {isSubmitting ? "Saving..." : submitLabel ?? "Add Bill"}
        </Button>
      </div>
    </form>
  );
}
