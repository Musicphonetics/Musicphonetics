"use client";

import { getSupabase } from "./client";
import type { Student, StudentStat, Payment } from "./types";
import { isValidCompleted } from "@/lib/attendance";
import { chaptersOf, isActiveDate, type SettledChapter } from "@/lib/settlement";
import { classesForPayment } from "@/lib/cycles";

// Loads the signed-in teacher's roster with computed stats, reading the BASE
// tables (students, class_updates, payments) rather than the student_stats
// view - so it works regardless of how the view's grants / security_invoker
// are configured. RLS still scopes everything to the teacher. Returns any
// error string so the UI can show it instead of a blank "no students".
export async function loadRoster(): Promise<{ rows: StudentStat[]; error: string | null }> {
  const sb = getSupabase();

  const [studentsRes, classesRes] = await Promise.all([
    sb.from("students").select("*").order("name"),
    sb.from("class_updates").select("student_id,class_date,class_status,attendance_status,counts_toward_cycle"),
  ]);
  // classes_included may not exist on older portals — fall back without it.
  let paymentsRes = await sb.from("payments").select("student_id,payment_date,amount_paid,classes_included,teacher_share,payment_status");
  if (paymentsRes.error && /classes_included/i.test(paymentsRes.error.message)) {
    paymentsRes = await sb.from("payments").select("student_id,payment_date,amount_paid,teacher_share,payment_status");
  }

  const err = studentsRes.error || classesRes.error || paymentsRes.error;
  if (studentsRes.error) return { rows: [], error: studentsRes.error.message };

  // A student's timeline can hold closed, labelled chapters (e.g. a History
  // stretch). Classes/payments inside one are settled history and don't count
  // toward the current account. active() is that filter.
  const chapters = new Map<string, SettledChapter[]>();
  const feeOf = new Map<string, number | null>();
  const cpmOf = new Map<string, number | null>();
  for (const s of (studentsRes.data as Student[] ?? [])) {
    chapters.set(s.id, chaptersOf(s));
    feeOf.set(s.id, s.fee_quoted ?? null);
    cpmOf.set(s.id, s.classes_per_month ?? null);
  }
  const active = (sid: string, dateISO: string | null) => isActiveDate(dateISO, chapters.get(sid) ?? []);

  const completed = new Map<string, number>();
  for (const c of classesRes.data ?? []) {
    if (isValidCompleted(c) && active(c.student_id, c.class_date)) completed.set(c.student_id, (completed.get(c.student_id) ?? 0) + 1);
  }
  const paid = new Map<string, number>();
  const share = new Map<string, number>();
  // Paid classes = sum of what each payment covers (auto from the rate, or the
  // explicit "classes this covers"), so variable-value payments total correctly.
  const purchasedCount = new Map<string, number>();
  for (const p of paymentsRes.data ?? []) {
    if (!active(p.student_id, p.payment_date)) continue;
    paid.set(p.student_id, (paid.get(p.student_id) ?? 0) + (p.amount_paid ?? 0));
    share.set(p.student_id, (share.get(p.student_id) ?? 0) + (p.teacher_share ?? 0));
    purchasedCount.set(p.student_id, (purchasedCount.get(p.student_id) ?? 0) + classesForPayment(p as Payment, feeOf.get(p.student_id), cpmOf.get(p.student_id)));
  }

  const rows: StudentStat[] = (studentsRes.data as Student[] ?? []).map((s) => {
    const done = completed.get(s.id) ?? 0;
    const totalPaid = paid.get(s.id) ?? 0;
    const purchased = purchasedCount.get(s.id) ?? 0;
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
      weekly_slots: (s.weekly_slots as StudentStat["weekly_slots"]) ?? [],
      weekly_target: s.weekly_target ?? null,
      settlements: (s.settlements as StudentStat["settlements"]) ?? [],
      settled_until: s.settled_until ?? null,
      settlement_note: s.settlement_note ?? null,
    };
  });

  // Non-fatal errors on the aggregate tables shouldn't hide the roster.
  return { rows, error: studentsRes.error ? err?.message ?? null : null };
}
