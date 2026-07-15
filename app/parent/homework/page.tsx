"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import { cn } from "@/lib/utils";

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

export default function ParentHomework() {
  const [data, setData] = useState<ParentData | null>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    loadParentData().then(setData);
  }, []);

  const student = data?.students[idx] ?? null;
  const items = useMemo(() => {
    if (!data || !student) return [];
    return data.classes
      .filter((c) => c.student_id === student.id && c.homework?.trim())
      .sort((a, b) => (a.class_date < b.class_date ? 1 : -1));
  }, [data, student]);

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Homework">
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your profile." />
      ) : (
        <div className="space-y-4">
          {data.students.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {data.students.map((s, i) => (
                <button key={s.id} onClick={() => setIdx(i)}
                  className={cn("shrink-0 rounded-full px-4 py-2 text-sm font-medium", i === idx ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/70")}>{s.name.split(" ")[0]}</button>
              ))}
            </div>
          )}
          {items.length === 0 ? (
            <EmptyState title="No homework yet" hint="Homework your teacher sets after each class will appear here." />
          ) : (
            <div className="space-y-3">
              {items.map((c) => (
                <div key={c.id} className="rounded-2xl border border-hairline bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#7A5E0F]">{pretty(c.class_date)}</p>
                  <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-ink/85">{c.homework}</p>
                  {c.taught && <p className="mt-2 text-xs text-ink/55">Covered: {c.taught}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </PortalShell>
  );
}
