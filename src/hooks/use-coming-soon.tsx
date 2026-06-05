"use client";

import { useState, useCallback } from "react";
import { Toast } from "@/components/ui/toast";

export function useComingSoon() {
  const [message, setMessage] = useState<string | null>(null);

  const showComingSoon = useCallback((msg?: string) => {
    setMessage(msg ?? "This feature is coming soon!");
  }, []);

  const dismissToast = useCallback(() => {
    setMessage(null);
  }, []);

  const toastElement = message != null ? (
    <Toast message={message} variant="info" onDismiss={dismissToast} />
  ) : null;

  return { toastElement, showComingSoon };
}
