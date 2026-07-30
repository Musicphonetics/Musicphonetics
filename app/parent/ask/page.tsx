"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { AskAI } from "@/components/parent/AskAI";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import { useSelectedStudent } from "@/lib/family";
import { FamilySwitcher } from "@/components/parent/FamilySwitcher";

export default function ParentAsk() {
  const [data, setData] = useState<ParentData | null>(null);

  const reload = () => loadParentData().then(setData);
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    reload();
  }, []);

  const { student, select } = useSelectedStudent(data?.students);
  const switcher = data && data.students.length > 0
    ? <FamilySwitcher students={data.students} selectedId={student?.id ?? null} onSelect={select} onAdded={reload} />
    : null;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Ask" subtitle="Student Portal" headerRight={switcher}>
      <AskAI studentName={student?.name} instrument={student?.instrument} />
    </PortalShell>
  );
}
