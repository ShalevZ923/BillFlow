import type { ReactNode } from "react";
import { CheckCircle2, LockKeyhole } from "lucide-react";
import { BrandMark } from "@/components/public/brand-mark";

type AuthShellProps = {
  variant: "login" | "signup";
  children: ReactNode;
};

const copy = {
  login: {
    heading: "Your bill command center is waiting",
    body: "Log in to review overdue items, record payments, and keep every due date in one workflow.",
    items: ["Overdue review", "Payment status", "Currency-aware totals"]
  },
  signup: {
    heading: "Start with a cleaner bill workflow",
    body: "Create a free BillFlow account and turn bills, imports, reminders, and payments into one operating surface.",
    items: ["Import-ready", "Smart reminders", "Payment tracking"]
  }
};

export function AuthShell({ variant, children }: AuthShellProps) {
  const content = copy[variant];

  return (
    <main className="min-h-[calc(100vh-64px)] bg-[linear-gradient(90deg,hsl(var(--primary)/0.06),transparent_42%),hsl(var(--background))] px-5 py-10">
      <div className="mx-auto grid min-h-[calc(100vh-144px)] max-w-6xl overflow-hidden rounded-lg border border-border bg-card shadow-sm lg:grid-cols-[minmax(0,0.82fr)_minmax(420px,1fr)]">
        <section className="flex flex-col justify-between gap-8 border-b border-border bg-primary/[0.04] p-6 lg:border-b-0 lg:border-r lg:p-8">
          <div>
            <BrandMark />
            <div className="mt-12 max-w-sm">
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{content.heading}</h1>
              <p className="mt-4 text-sm leading-6 text-muted-foreground">{content.body}</p>
            </div>
            <div className="mt-8 rounded-lg border border-border bg-card p-4 shadow-sm">
              <p className="text-sm font-semibold">At a glance</p>
              <div className="mt-4 flex flex-col gap-3">
                {content.items.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <CheckCircle2 className="text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LockKeyhole />
            Your data is encrypted and private by default.
          </div>
        </section>

        <section className="flex items-center justify-center p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[390px]">{children}</div>
        </section>
      </div>
    </main>
  );
}
