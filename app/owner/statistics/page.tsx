"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadStudentStats, type StudentStats, type StatBucket } from "@/lib/supabase/stats";

export default function OwnerStatistics() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    loadStudentStats().then(({ stats, error }) => {
      if (/column|does not exist|schema cache/i.test(error || "")) setErr("Run supabase/student_admission_fields.sql to enable the full admission fields.");
      else setErr(error);
      setStats(stats); setLoading(false);
    });
  }, []);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Statistics">
      {err && <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">{err}</div>}
      {loading ? <Loading /> : !stats ? (
        <p className="text-sm text-ink/60">No data yet.</p>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Kpi label="Total students" value={stats.total} />
            <Kpi label="Active" value={stats.active} />
            <Kpi label="Details filled" value={`${stats.filled}/${stats.total}`} hint="Admission form completed" />
            <Kpi label="Instruments" value={stats.instruments.length} hint="Distinct" />
          </div>

          <p className="text-xs leading-relaxed text-ink/55">
            Ask your teachers to open each student → <b>Admission details</b> and fill the form. As you approach 100 students,
            these charts become a real map of your market — schools, localities, ages, instruments and the families you serve.
          </p>

          <div className="grid gap-4 lg:grid-cols-2">
            <Panel title="Gender" buckets={stats.gender} total={stats.total} />
            <Panel title="Age groups" buckets={stats.ageBands} total={stats.total} />
            <Panel title="Program" buckets={stats.plans} total={stats.total} />
            <Panel title="Status" buckets={stats.statuses} total={stats.total} />
            <Panel title="Instruments" buckets={stats.instruments} total={stats.total} />
            <Panel title="Class / Grade" buckets={stats.grades} total={stats.total} />
            <Panel title="Top localities" buckets={stats.areas} total={stats.total} limit={10} />
            <Panel title="Top schools" buckets={stats.schools} total={stats.total} limit={10} />
            <Panel title="Parent occupation" buckets={stats.occupations} total={stats.total} limit={12} />
            <Panel title="Lead source" buckets={stats.leadSources} total={stats.total} />
            <Panel title="Students per teacher" buckets={stats.teachers} total={stats.total} limit={12} />
            <Panel title="New students by month" buckets={stats.newByMonth} total={stats.total} limit={12} />
          </div>
        </div>
      )}
    </PortalShell>
  );
}

function Kpi({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink/55">{label}</p>
      <p className="mt-1 font-display text-2xl font-semibold text-ink">{value}</p>
      {hint && <p className="text-[11px] text-ink/45">{hint}</p>}
    </div>
  );
}

function Panel({ title, buckets, total, limit = 8 }: { title: string; buckets: StatBucket[]; total: number; limit?: number }) {
  const shown = buckets.slice(0, limit);
  const max = Math.max(1, ...shown.map((b) => b.count));
  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <p className="font-display text-base font-semibold text-ink">{title}</p>
      {shown.length === 0 ? (
        <p className="mt-3 text-sm text-ink/45">No data yet.</p>
      ) : (
        <div className="mt-3 space-y-2.5">
          {shown.map((b) => {
            const pct = total ? Math.round((b.count / total) * 100) : 0;
            return (
              <div key={b.label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-ink/80">{b.label}</span>
                  <span className="shrink-0 font-semibold text-ink">{b.count} <span className="text-xs font-normal text-ink/45">· {pct}%</span></span>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-mist">
                  <div className="h-full rounded-full bg-gradient-to-r from-gold to-deep-gold" style={{ width: `${Math.round((b.count / max) * 100)}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
