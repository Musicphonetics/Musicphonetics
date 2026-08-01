"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";

const pretty = (iso: string) => new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

export default function ParentHomework() {
  const [data, setData] = useState<ParentData | null>(null);

  const reload = () => loadParentData().then(setData);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const items = useMemo(() => {
    if (!data || !student) return [];
    return data.classes
      .filter((c) => c.student_id === student.id && c.homework?.trim())
      .sort((a, b) => (a.class_date < b.class_date ? 1 : -1));
  }, [data, student]);
  const switcher = data
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Homework" headerRight={switcher}>
      {!data ? <Loading /> : data.students.length === 0 ? (
        <EmptyState title="No student linked yet" hint="Message us on WhatsApp to link your profile." />
      ) : (
        <div className="space-y-4">
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
