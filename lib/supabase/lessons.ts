"use client";

import { getSupabase } from "./client";
import type { Student, ClassUpdate } from "./types";

// Read-only helpers for the new /app education views (Phase 3a). No writes.
// Authorisation is enforced by Supabase RLS; we additionally re-check ownership
// in JS (belt-and-braces, as lib/supabase/parent.ts does), so a direct link to
// another teacher's student id can never surface their record even if a policy
// were broader than expected.

export type TeacherStudent =
  | { ok: true; student: Student; lessons: ClassUpdate[]; error: string | null }
  | { ok: false; unauthorized: boolean; error: string | null };

export async function loadTeacherStudent(studentId: string): Promise<TeacherStudent> {
  const sb = getSupabase();
  const { data: { session } } = await sb.auth.getSession();
  const uid = session?.user?.id ?? null;
  if (!uid) return { ok: false, unauthorized: true, error: null };

  const sRes = await sb.from("students").select("*").eq("id", studentId).maybeSingle();
  if (sRes.error) return { ok: false, unauthorized: false, error: sRes.error.message };

  const student = (sRes.data as Student | null) ?? null;
  // RLS should already scope this; the explicit check guarantees a teacher only
  // ever sees a student actually assigned to them.
  if (!student || student.teacher_id !== uid) return { ok: false, unauthorized: true, error: null };

  const cRes = await sb
    .from("class_updates").select("*")
    .eq("student_id", studentId)
    .order("class_date", { ascending: false });

  return { ok: true, student, lessons: (cRes.data as ClassUpdate[]) ?? [], error: cRes.error?.message ?? null };
}

// Recent lessons across the signed-in teacher's own students (RLS-scoped).
export async function loadRecentLessons(limit = 8): Promise<{ lessons: ClassUpdate[]; error: string | null }> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("class_updates").select("*")
    .order("class_date", { ascending: false })
    .limit(limit);
  return { lessons: (data as ClassUpdate[]) ?? [], error: error?.message ?? null };
}
