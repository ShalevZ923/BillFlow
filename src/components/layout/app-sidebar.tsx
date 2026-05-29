"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import {
  LayoutDashboard,
  FileText,
  CreditCard,
  DollarSign,
  Calculator,
  Upload,
  Settings
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Bills", href: "/bills", icon: FileText },
  { label: "Payments", href: "/payments", icon: CreditCard },
  { label: "Currency", href: "/currency", icon: DollarSign },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "Import/Export", href: "/import-export", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-white">
      <div className="flex h-[72px] items-center gap-3 border-b border-border px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
          BF
        </div>
        <span className="font-semibold">BillFlow</span>
      </div>
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-background hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
