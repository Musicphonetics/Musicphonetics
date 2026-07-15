import type { Student } from "./supabase/types";

// Human-readable student code, e.g. MP-2026-000123. Generated server-side by
// the SQL trigger; this only formats/guards for display.
export function studentCode(s: { student_code?: string | null }): string {
  return (s.student_code || "").trim() || "—";
}

// Search a student by name, parent name, phone, email or student code.
export function matchesStudent(
  q: string,
  s: Pick<Student, "name" | "parent_name" | "parent_phone" | "parent_email" | "student_code">,
): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const hay = [s.name, s.parent_name, s.parent_phone, s.parent_email, s.student_code]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}
