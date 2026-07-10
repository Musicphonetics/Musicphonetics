"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import { cn } from "@/lib/utils";

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

export default function ParentClasses() {
  const [data, setData] = useState<ParentData | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then((d) => { setErr(d.error); setData(d); });
  }, []);

  const student = data?.students[idx] ?? null;
  const classes = useMemo(
    () => (data && student ? data.classes.filter((c) => c.student_id === student.id) : []),
    [data, student]
  );

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Class updates">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your child's profile." />
      ) : (
        <div className="space-y-3">
          {data.students.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.students.map((s, i) => (
                <button key={s.id} onClick={() => setIdx(i)}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium", i === idx ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/70")}>{s.name}</button>
              ))}
            </div>
          )}
          {classes.length === 0 ? (
            <EmptyState title="No classes logged yet" hint="Every class update your teacher writes will appear here." />
          ) : classes.map((c, i) => (
            <div key={c.id} className="rounded-2xl border border-hairline bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-ink">{pretty(c.class_date)}</p>
                <div className="flex items-center gap-2">
                  {c.class_number != null && <span className="rounded-full bg-mist px-2 py-0.5 text-[11px] font-medium text-ink/60">Class {c.class_number}</span>}
                  <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold",
                    c.class_status === "Completed" ? "bg-feature-green/10 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>{c.class_status}</span>
                </div>
              </div>
              <div className="mt-2 space-y-1.5">
                {c.taught && <Row k="Taught">{c.taught}</Row>}
                {c.homework && <Row k="Homework">{c.homework}</Row>}
                {c.student_response && <Row k="How it went">{c.student_response}</Row>}
                {c.parent_feedback && <Row k="Your note">{c.parent_feedback}</Row>}
                {c.teacher_notes && <Row k="Teacher note">{c.teacher_notes}</Row>}
                {c.next_class_date && <Row k="Next class">{pretty(c.next_class_date)}</Row>}
                {!c.taught && !c.homework && !c.student_response && !c.teacher_notes && <p className="text-sm text-ink/45">Class {c.class_status.toLowerCase()}.</p>}
              </div>
              {i === 0 && <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#7A5E0F]">Most recent</p>}
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}

function Row({ k, children }: { k: string; children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-ink/80"><span className="font-semibold text-ink">{k}:</span> {children}</p>;
}
