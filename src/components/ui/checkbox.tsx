"use client"

import { forwardRef, type ComponentProps } from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const Checkbox = forwardRef<
  HTMLInputElement,
  ComponentProps<"input">
>(function Checkbox({ className, disabled, ...props }, ref) {
  return (
    <span
      data-slot="checkbox"
      className={cn(
        "relative inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border border-border transition-colors focus-within:ring-2 focus-within:ring-ring/20",
        props.checked && "border-primary bg-primary",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      <input
        ref={ref}
        type="checkbox"
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
        {...props}
      />
      {props.checked && (
        <Check size={12} className="text-primary-foreground pointer-events-none" />
      )}
    </span>
  )
})

export { Checkbox }
