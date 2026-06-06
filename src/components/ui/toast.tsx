"use client"

import { useState, useCallback, useEffect } from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ToastVariant = "success" | "error" | "info"

type ToastProps = {
  message: string
  variant: ToastVariant
  onDismiss?: () => void
}

const variantStyles: Record<ToastVariant, string> = {
  success: "bg-primary text-white",
  error: "bg-destructive text-white",
  info: "bg-foreground text-background dark:text-foreground",
}

const dismissDelay: Record<ToastVariant, number> = {
  success: 3000,
  error: 5000,
  info: 5000,
}

function Toast({ message, variant, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true)

  const handleDismiss = useCallback(() => {
    setVisible(false)
    setTimeout(() => onDismiss?.(), 200)
  }, [onDismiss])

  useEffect(() => {
    const timer = setTimeout(handleDismiss, dismissDelay[variant])
    return () => clearTimeout(timer)
  }, [variant, handleDismiss])

  if (!visible) {
    return (
      <div
        data-slot="toast"
        role="alert"
        aria-hidden="true"
        className="animate-out fade-out-0 pointer-events-none fixed right-4 bottom-4 z-50 duration-200"
      />
    )
  }

  return (
    <div
      data-slot="toast"
      role="alert"
      aria-live="assertive"
      className={cn(
        "animate-in fade-in-0 fixed right-4 bottom-4 z-50 flex items-center gap-3 rounded-lg px-4 py-3 text-sm shadow-lg duration-200",
        variantStyles[variant]
      )}
    >
      <span className="flex-1">{message}</span>
      <Button
        variant="ghost"
        size="icon-xs"
        className="text-current hover:bg-white/20"
        onClick={handleDismiss}
        aria-label="Dismiss notification"
      >
        <X />
      </Button>
    </div>
  )
}

export { Toast }
export type { ToastProps, ToastVariant }
