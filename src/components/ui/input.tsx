import { clsx } from "clsx";
import type { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  error?: string;
};

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div>
      <input
        className={clsx(
          "h-10 w-full rounded-md border bg-white px-3 text-sm text-foreground placeholder:text-muted/60 focus:outline-hidden focus:ring-2 focus:ring-primary/20",
          error ? "border-destructive" : "border-border",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
