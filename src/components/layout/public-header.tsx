import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/public/brand-mark";

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
      <div className="mx-auto flex min-h-[64px] w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <BrandMark />
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
