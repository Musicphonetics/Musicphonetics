"use client";

// Lead analytics — computed in the DB (mp_lead_analytics), rendered here. Used by
// the sales dashboard and (collapsible) the owner/sales lead centre.
import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface Row { label: string; count: number; converted?: number; rate?: number }
interface Analytics {
  total: number; today: number; week: number; unassigned: number; due: number; trials: number;
  converted: number; lost: number; conversion_rate: number | null;
  by_instrument: Row[]; by_source: Row[]; by_teacher: Row[];
}

export function LeadAnalytics() {
  const [a, setA] = useState<Analytics | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    if (!isSupabaseConfigured()) { setErr("Not configured"); return; }
    getSupabase().rpc("mp_lead_analytics").then(({ data, error }) => {
      if (error) setErr(error.message); else setA(data as Analytics);
    });
  }, []);

  if (err) return <p className="rounded-lg bg-mist px-3 py-2 text-xs text-ink/70">{err.includes("function") || err.includes("exist") ? "Run supabase/lead_analytics.sql to enable analytics." : err}</p>;
  if (!a) return <p className="text-sm text-ink/50">Loading analytics…</p>;

  const kpis = [
    { label: "Total leads", val: a.total }, { label: "This week", val: a.week },
    { label: "Unassigned", val: a.unassigned }, { label: "Follow-up due", val: a.due },
    { label: "Converted", val: a.converted }, { label: "Conversion", val: a.conversion_rate != null ? `${a.conversion_rate}%` : "—" },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-xl border border-hairline bg-white p-3">
            <p className="font-display text-xl font-semibold text-ink">{k.val}</p>
            <p className="text-[11px] text-ink/55">{k.label}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <BarList title="By instrument" rows={a.by_instrument} />
        <BarList title="By source" rows={a.by_source} showConverted />
        <BarList title="By teacher (conversion)" rows={a.by_teacher} showRate />
      </div>
    </div>
  );
}

function BarList({ title, rows, showConverted, showRate }: { title: string; rows: Row[]; showConverted?: boolean; showRate?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-ink/50">{title}</p>
      {rows.length === 0 ? <p className="text-sm text-ink/40">No data yet.</p> : (
        <ul className="space-y-2.5">
          {rows.map((r, i) => (
            <li key={i}>
              <div className="flex items-center justify-between text-sm">
                <span className="truncate pr-2 text-ink/80">{r.label}</span>
                <span className="shrink-0 font-medium text-ink/70">
                  {r.count}{showConverted && r.converted != null ? <span className="text-feature-green"> · {r.converted} conv</span> : null}{showRate && r.rate != null ? <span className="text-[#7A5E0F]"> · {r.rate}%</span> : null}
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-mist">
                <div className={cn("h-full rounded-full", showRate ? "bg-gradient-to-r from-gold to-deep-gold" : "bg-ink/70")} style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
