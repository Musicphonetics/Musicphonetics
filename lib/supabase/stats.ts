"use client";

import { getSupabase } from "./client";
import type { Student } from "./types";
import { studentPlan, PLAN_LABEL } from "@/lib/plan";
import { AGE_BANDS, ageFromDob } from "@/lib/admission";

export interface StatBucket { label: string; count: number }

export interface StudentStats {
  total: number;
  active: number;
  filled: number; // how many have demographic detail filled (gender or dob)
  gender: StatBucket[];
  ageBands: StatBucket[];
  grades: StatBucket[];
  areas: StatBucket[];
  schools: StatBucket[];
  instruments: StatBucket[];
  plans: StatBucket[];
  statuses: StatBucket[];
  occupations: StatBucket[];
  leadSources: StatBucket[];
  teachers: StatBucket[];
  newByMonth: StatBucket[];
}

function tally(items: (string | null | undefined)[]): StatBucket[] {
  const m = new Map<string, number>();
  for (const raw of items) {
    const label = (raw ?? "").trim();
    if (!label) continue;
    m.set(label, (m.get(label) ?? 0) + 1);
  }
  return [...m.entries()].map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

// Owner-only: aggregate the whole student base into demographics. RLS lets the
// owner read every student; a teacher would only see their own (still useful).
export async function loadStudentStats(): Promise<{ stats: StudentStats | null; error: string | null }> {
  const sb = getSupabase();
  const { data, error } = await sb.from("students").select("*");
  if (error) return { stats: null, error: error.message };
  const students = (data as Student[]) ?? [];

  // Teacher names for the "students per teacher" view.
  const teacherIds = [...new Set(students.map((s) => s.teacher_id).filter(Boolean))];
  const nameById = new Map<string, string>();
  if (teacherIds.length) {
    const { data: profs } = await sb.from("profiles").select("id,full_name").in("id", teacherIds);
    for (const p of (profs as { id: string; full_name: string | null }[]) ?? []) nameById.set(p.id, p.full_name || "Teacher");
  }

  const ageBandOf = (dob?: string | null) => {
    const a = ageFromDob(dob);
    if (a == null) return null;
    return AGE_BANDS.find((b) => a >= b.min && a < b.max)?.label ?? null;
  };
  const monthOf = (iso?: string | null) => {
    const src = iso || "";
    const d = new Date(src);
    if (!src || isNaN(+d)) return null;
    return d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
  };

  const stats: StudentStats = {
    total: students.length,
    active: students.filter((s) => s.status === "active").length,
    filled: students.filter((s) => (s.gender && s.gender.trim()) || s.dob).length,
    gender: tally(students.map((s) => s.gender)),
    ageBands: orderBands(tally(students.map((s) => ageBandOf(s.dob)))),
    grades: tally(students.map((s) => s.school_grade)),
    areas: tally(students.map((s) => s.area)),
    schools: tally(students.map((s) => s.school)),
    instruments: tally(students.map((s) => s.instrument)),
    plans: tally(students.map((s) => PLAN_LABEL[studentPlan(s)])),
    statuses: tally(students.map((s) => s.status)),
    occupations: tally(students.map((s) => s.parent_occupation)),
    leadSources: tally(students.map((s) => s.lead_source)),
    teachers: tally(students.map((s) => (s.teacher_id ? nameById.get(s.teacher_id) ?? "Unassigned" : "Unassigned"))),
    newByMonth: tally(students.map((s) => monthOf(s.start_date || s.created_at))),
  };
  return { stats, error: null };
}

// Keep age bands in their natural order (not by count).
function orderBands(buckets: StatBucket[]): StatBucket[] {
  const order = AGE_BANDS.map((b) => b.label);
  return [...buckets].sort((a, b) => order.indexOf(a.label) - order.indexOf(b.label));
}
