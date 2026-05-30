"use client";

import { useState, useEffect } from "react";
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
  Settings,
  Moon,
  Sun
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
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return next;
    });
  };

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-border bg-white dark:bg-card dark:border-border">
      <div className="flex h-[72px] items-center gap-3 border-b border-border px-5 dark:border-border/60">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
          BF
        </div>
        <span className="font-semibold dark:text-foreground">BillFlow</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
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
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "text-muted-foreground hover:bg-background hover:text-foreground dark:hover:bg-muted dark:hover:text-foreground"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3 dark:border-border/60">
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground dark:hover:bg-muted dark:hover:text-foreground"
        >
          {mounted && dark ? <Sun size={18} /> : <Moon size={18} />}
          {mounted ? (dark ? "Light Mode" : "Dark Mode") : "Theme"}
        </button>
      </div>
    </aside>
  );
}
