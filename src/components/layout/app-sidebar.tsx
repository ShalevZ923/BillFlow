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
  Sun,
  ChevronLeft,
  ChevronRight,
  X
} from "lucide-react";

type NotificationCounts = Partial<Record<string, number>>;

type AppSidebarProps = {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  notificationCounts?: NotificationCounts;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
};

const navItems = [
  { key: "dashboard", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { key: "bills", label: "Bills", href: "/bills", icon: FileText },
  { key: "payments", label: "Payments", href: "/payments", icon: CreditCard },
  { key: "currency", label: "Currency", href: "/currency", icon: DollarSign },
  { key: "calculator", label: "Calculator", href: "/calculator", icon: Calculator },
  { key: "import-export", label: "Import/Export", href: "/import-export", icon: Upload },
  { key: "settings", label: "Settings", href: "/settings", icon: Settings }
];

export function AppSidebar({
  collapsed = false,
  onToggleCollapse,
  notificationCounts = {},
  mobileOpen = false,
  onMobileClose
}: AppSidebarProps) {
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
    <aside
      className={clsx(
        "flex shrink-0 flex-col border-r border-border bg-white dark:bg-card dark:border-border",
        "fixed inset-y-0 left-0 z-40 w-64 transition-transform duration-300 ease-in-out",
        mobileOpen ? "translate-x-0" : "-translate-x-full",
        "md:static md:z-auto md:h-auto md:translate-x-0 md:transition-all md:duration-300",
        collapsed ? "md:w-16" : "md:w-56"
      )}
    >
      <div className="flex h-[72px] items-center gap-3 border-b border-border px-5 dark:border-border/60">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-white">
          BF
        </div>
        {!collapsed && (
          <span className="truncate font-semibold dark:text-foreground">BillFlow</span>
        )}
        <button
          onClick={onMobileClose}
          aria-label="Close sidebar"
          className="ml-auto rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground md:hidden"
        >
          <X size={18} />
        </button>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const count = notificationCounts[item.key];

          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                  : "text-muted-foreground hover:bg-background hover:text-foreground dark:hover:bg-muted dark:hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              onClick={onMobileClose}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
              {!collapsed && count != null && count > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="flex flex-col gap-1 border-t border-border p-3 dark:border-border/60">
        <button
          onClick={onToggleCollapse}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className={clsx(
            "hidden items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground dark:hover:bg-muted dark:hover:text-foreground md:flex",
            collapsed && "justify-center px-2"
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && "Collapse"}
        </button>
        <button
          onClick={toggleTheme}
          aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          className={clsx(
            "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground dark:hover:bg-muted dark:hover:text-foreground",
            collapsed && "justify-center px-2"
          )}
        >
          {mounted && dark ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && (mounted ? (dark ? "Light Mode" : "Dark Mode") : "Theme")}
        </button>
      </div>
    </aside>
  );
}
