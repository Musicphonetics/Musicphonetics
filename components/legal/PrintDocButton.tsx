"use client";

import { printDoc } from "@/lib/print";

// Small client button so a server-rendered legal page can still print cleanly.
export function PrintDocButton({ targetId, label = "Print / Save as PDF" }: { targetId: string; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => printDoc(targetId)}
      className="no-print inline-flex items-center gap-2 rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-ink hover:bg-ink hover:text-paper"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a1 1 0 0 1-1 1h-2M6 14h12v7H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      {label}
    </button>
  );
}
