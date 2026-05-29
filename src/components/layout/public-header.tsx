import Link from "next/link";
import { Button } from "@/components/ui/button";

export function PublicHeader() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex min-h-[72px] w-full max-w-6xl items-center justify-between px-5">
        <div className="flex items-center gap-8">
          <Link className="flex items-center gap-3 font-semibold" href="/">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
              BF
            </div>
            BillFlow
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
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
