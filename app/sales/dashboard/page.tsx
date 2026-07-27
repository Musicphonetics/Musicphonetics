"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { SALES_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadLeadStats } from "@/lib/supabase/leads";

export default function SalesDashboard() {
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured()) { setStats({}); return; }
    loadLeadStats().then(setStats).catch(() => setStats({}));
  }, []);

  const cards: { label: string; key: string; tone: string }[] = [
    { label: "New today", key: "today", tone: "text-[#7A5E0F]" },
    { label: "Unassigned", key: "unassigned", tone: "text-ink" },
    { label: "Follow-up due", key: "dueFollow", tone: "text-red-600" },
    { label: "Converted", key: "converted", tone: "text-feature-green" },
    { label: "Lost", key: "lost", tone: "text-ink/60" },
    { label: "Total leads", key: "total", tone: "text-ink" },
  ];

  return (
    <PortalShell role="sales" tabs={SALES_TABS} variant="wide" title="Lead department">
      {stats === null ? <Loading /> : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {cards.map((c) => (
              <div key={c.key} className="rounded-2xl border border-hairline bg-white p-5">
                <p className={`font-display text-3xl font-semibold ${c.tone}`}>{stats[c.key] ?? 0}</p>
                <p className="mt-1 text-sm text-ink/55">{c.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/sales/leads" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Open the lead centre →</Link>
          </div>
          <p className="mt-4 text-xs text-ink/50">You manage the lead pipeline: assign, contact, follow up and convert. You don’t see teacher HR/finance, payouts, or company settings.</p>
        </>
      )}
    </PortalShell>
  );
}
