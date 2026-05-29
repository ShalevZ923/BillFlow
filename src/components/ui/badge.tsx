import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "success" | "warning" | "destructive";

type BadgeProps = {
  variant?: BadgeVariant;
  children: ReactNode;
  className?: string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-background text-muted border border-border",
  success: "bg-primary/10 text-primary border border-primary/20",
  warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20"
};

export function Badge({ variant = "default", className, children }: BadgeProps) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
