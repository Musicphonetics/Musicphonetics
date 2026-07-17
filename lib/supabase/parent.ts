"use client";

import { getSupabase } from "./client";
import type { Student, ClassUpdate, Payment, Profile } from "./types";
import { isValidCompleted } from "@/lib/attendance";

// Everything a parent may see about THEIR own child/children. RLS restricts the
// rows to students where students.parent_id = auth.uid() (see the SQL). We read
// base tables only - the same class_updates the teacher wrote, never duplicated.
export interface ParentData {
  students: Student[];
  classes: ClassUpdate[];
  payments: Payment[];
  teachers: Record<string, string>; // teacher_id -> name
  error: string | null;
}

export async function loadParentData(): Promise<ParentData> {
  const sb = getSupabase();
  // TENANT ISOLATION: the Student Portal must only ever load the signed-in
  // family's own children. We filter explicitly on parent_id = auth.uid() and
  // do NOT rely on RLS alone — the students table also has teacher/owner SELECT
  // policies, so a broad select() would leak teacher-assigned students to any
  // staff account that opened this portal.
  const { data: { session } } = await sb.auth.getSession();
  const uid = session?.user?.id;
  if (!uid) return { students: [], classes: [], payments: [], teachers: {}, error: null };

  const sRes = await sb.from("students").select("*").eq("parent_id", uid).order("name");
  // Defensive: drop any row that somehow isn't this parent's (belt and braces).
  const students = ((sRes.data as Student[]) ?? []).filter((s) => s.parent_id === uid);
  const ids = students.map((s) => s.id);
  const teacherIds = [...new Set(students.map((s) => s.teacher_id).filter(Boolean))];

  const [cRes, pRes, tRes] = await Promise.all([
    ids.length ? sb.from("class_updates").select("*").in("student_id", ids).order("class_date", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    ids.length ? sb.from("payments").select("*").in("student_id", ids).order("payment_date", { ascending: false }) : Promise.resolve({ data: [], error: null }),
    teacherIds.length ? sb.from("profiles").select("id,full_name").in("id", teacherIds) : Promise.resolve({ data: [], error: null }),
  ]);

  const teachers: Record<string, string> = {};
  for (const t of (tRes.data as Pick<Profile, "id" | "full_name">[]) ?? []) teachers[t.id] = t.full_name || "Your teacher";

  return {
    students,
    classes: (cRes.data as ClassUpdate[]) ?? [],
    payments: (pRes.data as Payment[]) ?? [],
    teachers,
    error: sRes.error?.message || cRes.error?.message || pRes.error?.message || null,
  };
}

// Derived per-student view for the parent UI.
export interface StudentView {
  student: Student;
  teacherName: string;
  completed: number;
  perMonth: number;
  remaining: number;
  nextClassDate: string | null;
  latest: ClassUpdate | null;
  paymentStatus: string;
  renewalDue: boolean;
}

export function studentView(d: ParentData, student: Student): StudentView {
  const cls = d.classes.filter((c) => c.student_id === student.id);
  const completed = cls.filter(isValidCompleted).length;
  const perMonth = student.classes_per_month ?? 8;
  const remaining = Math.max(perMonth - (completed % perMonth || (completed && perMonth ? perMonth : 0)), 0);
  const latest = cls[0] ?? null; // already sorted desc
  const nextClassDate = cls.map((c) => c.next_class_date).find(Boolean) ?? null;
  const pays = d.payments.filter((p) => p.student_id === student.id);
  const paymentStatus = pays[0]?.payment_status ?? "Not recorded";
  const renewalDue = student.status === "active" && remaining <= 2;
  return {
    student, teacherName: d.teachers[student.teacher_id] || "Your teacher",
    completed, perMonth, remaining, nextClassDate, latest, paymentStatus, renewalDue,
  };
}

// Total completed classes for the student (for the Foundation Journey count).
export function completedCount(d: ParentData, studentId: string): number {
  return d.classes.filter((c) => c.student_id === studentId && isValidCompleted(c)).length;
}

// Anonymised community headlines the owner publishes (community_updates). Falls
// back to a curated set so the section is never empty. Best-effort - the table
// may not exist yet.
const FALLBACK_COMMUNITY = [
  "Students across Musicphonetics complete hundreds of tracked classes every month.",
  "Beginners are completing their first songs and stepping on stage at our open mics.",
  "“The class updates help us stay connected” - a Musicphonetics parent.",
];
export async function loadCommunity(): Promise<string[]> {
  try {
    const { data } = await getSupabase()
      .from("community_updates").select("headline").eq("is_published", true)
      .order("created_at", { ascending: false }).limit(5);
    const rows = (data as { headline: string }[] | null) ?? [];
    return rows.length ? rows.map((r) => r.headline) : FALLBACK_COMMUNITY;
  } catch {
    return FALLBACK_COMMUNITY;
  }
}
