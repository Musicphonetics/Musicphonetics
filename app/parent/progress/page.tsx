"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { FoundationJourney } from "@/components/parent/FoundationJourney";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, completedCount, type ParentData } from "@/lib/supabase/parent";
import { computeFoundation, skillIndicators } from "@/lib/foundation";
import { cn } from "@/lib/utils";

const isFoundation = (fee: number | null) => (fee ?? 8000) < 12000;

export default function ParentProgress() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then((d) => { setErr(d.error); setData(d); });
  }, []);

  const student = data?.students[idx] ?? null;
  const foundation = useMemo(() => {
    if (!data || !student) return null;
    return computeFoundation(completedCount(data, student.id), 1, false, !isFoundation(student.fee_quoted));
  }, [data, student]);
  const skills = foundation ? skillIndicators(foundation) : [];

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Learning journey">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : student && foundation ? (
        <div className="space-y-4">
          {data.students.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.students.map((s, i) => (
                <button key={s.id} onClick={() => setIdx(i)}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium", i === idx ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/70")}>{s.name}</button>
              ))}
            </div>
          )}

          {isFoundation(student.fee_quoted) ? (
            <FoundationJourney p={foundation} studentName={student.name} />
          ) : (
            <div className="rounded-2xl border border-gold/40 bg-white p-5">
              <p className="eyebrow">Learning path</p>
              <h3 className="mt-1 font-display text-lg font-semibold text-ink">Main Musicphonetics Pathway</h3>
              <p className="mt-1 text-sm text-ink/70">Structured progress in confidence, theory, ear training and performance preparation.</p>
            </div>
          )}

          {/* Skill indicators */}
          <div className="rounded-2xl border border-hairline bg-white p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-ink/55">Skill indicators</p>
            <div className="space-y-3">
              {skills.map((s) => (
                <div key={s.label}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-ink/80">{s.label}</span>
                    <span className="font-semibold text-ink">{s.value}%</span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-mist">
                    <div className="h-full rounded-full bg-gradient-to-r from-gold to-deep-gold" style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-ink/50">Indicators grow as your child progresses through the journey. Your teacher fine-tunes focus after every class.</p>
          </div>
        </div>
      ) : <Loading />}
    </PortalShell>
  );
}
