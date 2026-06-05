"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function WorkInProgressBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 px-4 py-3 text-sm text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
      <span className="flex-1">
        This feature is under active development — some capabilities are coming
        soon.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded p-0.5 text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  );
}
