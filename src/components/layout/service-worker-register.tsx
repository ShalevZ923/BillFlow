"use client";
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/pwa/register";

export function ServiceWorkerRegister() {
  useEffect(() => {
    registerServiceWorker();
  }, []);
  return null;
}
