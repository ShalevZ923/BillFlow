"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check } from "lucide-react";

export const paymentFormSchema = z.object({
  occurrenceId: z.string().min(1),
  paidAmount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Enter a valid amount"),
  paidCurrency: z.string().length(3),
  paidDate: z.string().min(1, "Date is required"),
  method: z.enum(["card", "bank", "cash", "transfer", "other"]),
  note: z.string().max(1000)
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;

type PaymentFormProps = {
  onSubmit: (data: PaymentFormValues) => void;
  isSubmitting?: boolean;
  occurrenceId?: string;
  currency?: string;
};

export function PaymentForm({
  onSubmit,
  isSubmitting,
  occurrenceId = "",
  currency = "USD"
}: PaymentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      occurrenceId,
      paidAmount: "",
      paidCurrency: currency,
      paidDate: new Date().toISOString().slice(0, 10),
      method: "card",
      note: ""
    }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("occurrenceId")} />
      <input type="hidden" {...register("paidCurrency")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="paidAmount">
            Paid amount *
          </label>
          <Input
            id="paidAmount"
            placeholder="99.99"
            error={errors.paidAmount?.message}
            {...register("paidAmount")}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="paidDate">
            Paid date *
          </label>
          <Input
            id="paidDate"
            type="date"
            error={errors.paidDate?.message}
            {...register("paidDate")}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium" htmlFor="method">
            Payment method
          </label>
          <select
            id="method"
            className="h-10 w-full rounded-md border border-border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            {...register("method")}
          >
            <option value="card">Card</option>
            <option value="bank">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="transfer">Transfer</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium" htmlFor="note">
            Note
          </label>
          <Input id="note" placeholder="Optional note" {...register("note")} />
          {errors.note && <p className="mt-1 text-sm text-destructive">{errors.note.message}</p>}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          <Check size={16} />
          {isSubmitting ? "Recording..." : "Record Payment"}
        </Button>
      </div>
    </form>
  );
}
