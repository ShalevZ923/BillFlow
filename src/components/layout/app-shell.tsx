"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { Menu } from "lucide-react";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Button } from "@/components/ui/button";

type AppShellProps = {
  children: ReactNode;
};

const EMPTY_NOTIFICATION_COUNTS = {};

export function AppShell({ children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen]);

  const handleToggleCollapse = useCallback(() => setCollapsed((c) => !c), []);
  const handleMobileClose = useCallback(() => setMobileOpen(false), []);
  const handleMobileOpen = useCallback(() => setMobileOpen(true), []);
  const handleOverlayClose = useCallback(() => setMobileOpen(false), []);

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        collapsed={collapsed}
        onToggleCollapse={handleToggleCollapse}
        notificationCounts={EMPTY_NOTIFICATION_COUNTS}
        mobileOpen={mobileOpen}
        onMobileClose={handleMobileClose}
      />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={handleOverlayClose}
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex h-14 items-center justify-between border-b border-border bg-white px-4 md:hidden dark:bg-card">
          <div>
            <span className="font-semibold dark:text-foreground">BillFlow</span>
            <span className="ml-1 text-xs text-muted-foreground">by SeeHy</span>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleMobileOpen}>
            <Menu />
          </Button>
        </header>
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
