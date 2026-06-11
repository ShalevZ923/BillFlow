import Link from "next/link";
import { cn } from "@/lib/utils";

type BrandMarkProps = {
  className?: string;
};

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <Link className={cn("flex items-center gap-2 font-semibold", className)} href="/">
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
        BF
      </span>
      <span className="text-base">BillFlow</span>
      <span className="text-xs font-semibold text-primary">by SeeHy</span>
    </Link>
  );
}
