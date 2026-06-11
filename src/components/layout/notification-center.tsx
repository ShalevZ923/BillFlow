"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, AlertTriangle, AlertCircle, CheckCircle, PlusCircle, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { getNotifications, type Notification } from "@/app/(app)/actions";

const STORAGE_KEY = "billflow-read-notifications";

const typeConfig = {
  upcoming: { icon: AlertTriangle, color: "text-amber-500" },
  overdue: { icon: AlertCircle, color: "text-red-500" },
  paid: { icon: CheckCircle, color: "text-green-500" },
  created: { icon: PlusCircle, color: "text-teal-500" }
} as const;

type NotificationCenterProps = {
  collapsed?: boolean;
};

export function NotificationCenter({ collapsed = false }: NotificationCenterProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...readIds]));
    } catch {
      // localStorage not writable
    }
  }, [readIds]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch {
      setNotifications([]);
    }
    setLoading(false);
  }, []);

  const toggle = useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const markAllRead = useCallback(() => {
    setReadIds(new Set(notifications.map((n) => n.id)));
  }, [notifications]);

  const handleNotificationClick = useCallback(
    (notification: Notification) => {
      setReadIds((prev) => new Set([...prev, notification.id]));
      setOpen(false);
      router.push(`/bills?bill=${encodeURIComponent(notification.billId)}`);
    },
    [router]
  );

  const unreadCount = notifications.filter((n) => !readIds.has(n.id)).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={toggle}
        aria-label="Notifications"
        className={cn(
          "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-background hover:text-foreground dark:hover:bg-muted dark:hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <div className="relative shrink-0">
          <Bell size={18} />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-medium text-destructive-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </div>
        {!collapsed && (
          <>
            <span className="flex-1 truncate text-left">Notifications</span>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-medium text-destructive-foreground">
                {unreadCount}
              </span>
            )}
          </>
        )}
      </button>

      {open && (
        <div className="absolute left-full top-0 ml-1 w-80 rounded-lg border border-border bg-white shadow-lg dark:bg-card z-50">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-semibold dark:text-foreground">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition"
              >
                <Check size={12} />
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-auto p-2">
            {loading ? (
              <p className="p-4 text-center text-sm text-muted-foreground">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted-foreground">No notifications</p>
            ) : (
              notifications.map((n) => {
                const config = typeConfig[n.type];
                const Icon = config.icon;
                const isRead = readIds.has(n.id);
                return (
                  <button
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-md px-3 py-2 text-left transition",
                      isRead
                        ? "text-muted-foreground hover:bg-muted"
                        : "bg-primary/5 hover:bg-primary/10 dark:bg-primary/10"
                    )}
                  >
                    <Icon size={16} className={cn("mt-0.5 shrink-0", config.color)} />
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-sm", !isRead && "font-medium text-foreground")}>
                        {n.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    {!isRead && (
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
