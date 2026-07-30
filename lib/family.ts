"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Student } from "@/lib/supabase/types";
import { getSupabase } from "@/lib/supabase/client";

const KEY = "mp-selected-student";

// One shared "which child am I viewing" selection, persisted across every parent
// page so a family with 2–3 children keeps the same child selected as they move
// around. Falls back to the first child when the stored one isn't in the list.
export function useSelectedStudent(students: Student[] | undefined) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") setSelectedId(window.localStorage.getItem(KEY));
  }, []);

  const student = useMemo(() => {
    const list = students ?? [];
    if (!list.length) return null;
    return list.find((s) => s.id === selectedId) ?? list[0];
  }, [students, selectedId]);

  const select = useCallback((id: string) => {
    setSelectedId(id);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, id);
  }, []);

  const index = useMemo(() => {
    const list = students ?? [];
    return Math.max(0, list.findIndex((s) => s.id === student?.id));
  }, [students, student]);

  return { student, selectedId: student?.id ?? null, select, index };
}

// Add another child to THIS logged-in family (same login). The office then
// assigns a teacher, plan and fees. Requires the parent's access token.
export async function linkChild(input: {
  name: string; instrument?: string; relation?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data } = await getSupabase().auth.getSession();
    const token = data.session?.access_token;
    if (!token) return { ok: false, error: "Please sign in again." };
    const res = await fetch("/api/link-child", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${token}` },
      body: JSON.stringify(input),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !body.ok) return { ok: false, error: body.error || "Couldn't add the child. Please try again." };
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Please try again." };
  }
}
