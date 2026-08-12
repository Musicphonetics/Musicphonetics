"use client";

import { getSupabase } from "./client";
import type { Student, StudentStat } from "./types";
import { isValidCompleted } from "@/lib/attendance";

// Loads the signed-in teacher's roster with computed stats, reading the BASE
// tables (students, class_updates, payments) rather than the student_stats
// view - so it works regardless of how the view's grants / security_invoker
// are configured. RLS still scopes everything to the teacher. Returns any
// error string so the UI can show it instead of a blank "no students".
export async function loadRoster(): Promise<{ rows: StudentStat[]; error: string | null }> {
  const sb = getSupabase();

  const [studentsRes, classesRes, paymentsRes] = await Promise.all([
    sb.from("students").select("*").order("name"),
    sb.from("class_updates").select("student_id,class_status,attendance_status,counts_toward_cycle"),
    sb.from("payments").select("student_id,amount_paid,teacher_share"),
  ]);

  const err = studentsRes.error || classesRes.error || paymentsRes.error;
  if (studentsRes.error) return { rows: [], error: studentsRes.error.message };

  const completed = new Map<string, number>();
  for (const c of classesRes.data ?? []) {
    if (isValidCompleted(c)) completed.set(c.student_id, (completed.get(c.student_id) ?? 0) + 1);
  }
  const paid = new Map<string, number>();
  const share = new Map<string, number>();
  for (const p of paymentsRes.data ?? []) {
    paid.set(p.student_id, (paid.get(p.student_id) ?? 0) + (p.amount_paid ?? 0));
    share.set(p.student_id, (share.get(p.student_id) ?? 0) + (p.teacher_share ?? 0));
  }

  const rows: StudentStat[] = (studentsRes.data as Student[] ?? []).map((s) => {
    const done = completed.get(s.id) ?? 0;
    const cpm = (s.classes_per_month ?? 0) > 0 ? (s.classes_per_month as number) : 8;
    const fee = s.fee_quoted ?? 0;
    const totalPaid = paid.get(s.id) ?? 0;
    // Each payment of the monthly fee buys one cycle of classes (fee = cpm
    // classes). Two payments = 2 cycles = 16 classes. Advance amounts are
    // handled naturally by dividing the total paid by the fee. Before any
    // payment is recorded we assume one cycle so a new student isn't shown as
    // "renewal due" on day one.
    const purchased = fee > 0 && totalPaid > 0 ? Math.round((totalPaid / fee) * cpm) : cpm;
    return {
      student_id: s.id,
      student_code: s.student_code ?? null,
      teacher_id: s.teacher_id,
      name: s.name,
      instrument: s.instrument,
      level: s.level,
      status: s.status,
      dob: s.dob,
      classes_per_month: s.classes_per_month,
      fee_quoted: s.fee_quoted,
      classes_completed: done,
      classes_purchased: purchased,
      classes_remaining: Math.max(purchased - done, 0),
      total_paid: totalPaid,
      teacher_share_total: share.get(s.id) ?? 0,
    };
  });

  // Non-fatal errors on the aggregate tables shouldn't hide the roster.
  return { rows, error: studentsRes.error ? err?.message ?? null : null };
}
