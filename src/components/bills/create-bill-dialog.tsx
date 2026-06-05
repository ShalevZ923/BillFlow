"use client";

import { useState } from "react";
import { BillForm } from "@/components/bills/bill-form";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import type { BillListItem } from "@/components/bills/bill-list";

type CreateBillDialogProps = {
  onBillCreated: (bill: BillListItem) => void;
};

export function CreateBillDialog({ onBillCreated }: CreateBillDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  function handleSubmit(data: Record<string, unknown>) {
    setIsSubmitting(true);

    setTimeout(() => {
      const newBill: BillListItem = {
        id: `bill-${Date.now()}`,
        name: String(data.name),
        amountCents: Math.round(parseFloat(String(data.amount)) * 100),
        currency: String(data.currency),
        dueDate: String(data.dueDate),
        category: String(data.category),
        priority: data.priority as BillListItem["priority"],
        status: data.status as BillListItem["status"],
        tags: String(data.tags)
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean),
      };

      onBillCreated(newBill);
      setIsSubmitting(false);
      setSuccess(true);

      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 800);
    }, 500);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button onClick={() => setOpen(true)}>
        <Plus size={16} />
        New Bill
      </Button>

      <DialogContent
        className="max-w-xl p-0 gap-0"
        overlayClassName="bg-black/40 backdrop-blur-md"
        showCloseButton={false}
      >
        <div className="relative">
          <div className="flex items-center gap-3 border-b border-border px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg font-semibold">
                {success ? "Bill created" : "Create new bill"}
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">
                {success
                  ? "Your bill has been added successfully."
                  : "Fill in the details below to track a new bill."}
              </DialogDescription>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>

          {success ? (
            <div className="flex flex-col items-center justify-center px-6 py-12">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Redirecting to your dashboard...
              </p>
            </div>
          ) : (
            <div className="px-6 py-5">
              <BillForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
