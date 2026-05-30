import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/95 backdrop-blur supports-backdrop-filter:bg-white/80 dark:bg-card/95">
      <div className="mx-auto flex min-h-[64px] w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-2 font-semibold" href="/">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              BF
            </div>
            <span>BillFlow</span>
            <span className="text-xs text-muted-foreground">by SeeHy</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/features">
              Features
            </Link>
            <Link className="text-sm text-muted-foreground transition hover:text-foreground" href="/pricing">
              Pricing
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm">Sign up free</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
