import { forwardRef, type ComponentProps } from "react"

import { cn } from "@/lib/utils"

const Label = forwardRef<
  HTMLLabelElement,
  ComponentProps<"label">
>(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
        className
      )}
      {...props}
    />
  )
})

export { Label }
