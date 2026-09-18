"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";

type Scan = { ref: string | null; created_at: string };
const isMissing = (m?: string) => !!m && /relation|does not exist|schema cache/i.test(m);

export default function OwnerQrScans() {
  const [scans, setScans] = useState<Scan[] | null>(null);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setScans([]); return; }
    getSupabase().from("qr_scans").select("ref,created_at").order("created_at", { ascending: false }).limit(2000)
      .then(({ data, error }) => {
        if (error) { if (isMissing(error.message)) setNeedsMigration(true); else setErr(error.message); setScans([]); return; }
        setScans((data as Scan[]) ?? []);
      });
  }, []);

  const stats = useMemo(() => {
    const rows = scans ?? [];
    const now = Date.now();
    const dayMs = 86400000;
    const byRef = new Map<string, number>();
    let today = 0, week = 0;
    for (const s of rows) {
      const ref = s.ref || "unknown";
      byRef.set(ref, (byRef.get(ref) ?? 0) + 1);
      const age = now - new Date(s.created_at).getTime();
      if (age < dayMs) today += 1;
      if (age < 7 * dayMs) week += 1;
    }
    const refs = [...byRef.entries()].sort((a, b) => b[1] - a[1]);
    return { total: rows.length, today, week, refs };
  }, [scans]);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} title="QR &amp; flyer scans" variant="wide">
      {needsMigration ? (
        <div className="rounded-2xl border border-hairline bg-white p-5">
          <p className="font-display text-lg font-semibold text-ink">Enable scan tracking</p>
          <p className="mt-2 text-sm text-ink/70">Run <code className="rounded bg-mist px-1">supabase/qr_scans.sql</code> once in Supabase to start recording flyer scans.</p>
        </div>
      ) : !scans ? <Loading /> : (
        <div className="space-y-6">
          <section className="grid grid-cols-3 gap-3">
            {[["Total scans", stats.total], ["Last 7 days", stats.week], ["Today", stats.today]].map(([k, v]) => (
              <div key={k} className="rounded-2xl border border-hairline bg-white p-5 text-center">
                <p className="font-display text-3xl font-bold text-ink">{v}</p>
                <p className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wide text-ink/50">{k}</p>
              </div>
            ))}
          </section>

          {err && <p className="rounded-xl bg-red-500/[0.07] px-3 py-2 text-sm text-red-700">{err}</p>}

          <section className="rounded-2xl border border-hairline bg-white p-5">
            <h2 className="font-display text-base font-semibold text-ink">Scans by code</h2>
            <p className="mt-1 text-xs text-ink/55">Each printed QR carries a <code className="rounded bg-mist px-1">ref</code> so you can see which placement is working.</p>
            {stats.refs.length === 0 ? (
              <div className="mt-4"><EmptyState title="No scans yet" hint="Scans will appear here as people scan your printed QR codes." /></div>
            ) : (
              <div className="mt-4 space-y-2">
                {stats.refs.map(([ref, count]) => {
                  const pct = stats.total ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={ref} className="flex items-center gap-3">
                      <span className="w-40 shrink-0 truncate font-mono text-xs text-ink/70">{ref}</span>
                      <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-ink/[0.06]">
                        <span className="block h-full rounded-full bg-gold" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-10 shrink-0 text-right font-display text-sm font-semibold text-ink">{count}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </PortalShell>
  );
}
