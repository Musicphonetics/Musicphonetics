"use client";

import { getSupabase } from "./client";
import type { Profile, Student, ClassUpdate, Payment, Payout } from "./types";

export interface OwnerData {
  teachers: Profile[];
  students: Student[];
  classes: Pick<ClassUpdate, "id" | "teacher_id" | "student_id" | "class_status" | "class_date">[];
  payments: Payment[];
  payouts: Payout[];
  error: string | null;
}

// Owner RLS returns every row, so we aggregate on the client — robust and free
// of view/grant dependencies. Fine for early scale; can move to get_owner_stats
// RPC + server pagination later.
export async function loadOwnerData(): Promise<OwnerData> {
  const sb = getSupabase();
  const [tRes, sRes, cRes, pRes, poRes] = await Promise.all([
    sb.from("profiles").select("*").eq("role", "teacher").order("full_name"),
    sb.from("students").select("*").order("name"),
    sb.from("class_updates").select("id,teacher_id,student_id,class_status,class_date"),
    sb.from("payments").select("*").order("payment_date", { ascending: false }),
    sb.from("payouts").select("*"),
  ]);
  const error =
    tRes.error?.message || sRes.error?.message || pRes.error?.message || poRes.error?.message || null;
  return {
    teachers: (tRes.data as Profile[]) ?? [],
    students: (sRes.data as Student[]) ?? [],
    classes: (cRes.data as OwnerData["classes"]) ?? [],
    payments: (pRes.data as Payment[]) ?? [],
    payouts: (poRes.data as Payout[]) ?? [],
    error,
  };
}

const monthKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}`;
const thisMonth = monthKey(new Date());

export function inThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  return !isNaN(+d) && monthKey(d) === thisMonth;
}

export function daysToBirthday(dob: string | null): number | null {
  if (!dob) return null;
  const d = new Date(dob); if (isNaN(+d)) return null;
  const now = new Date();
  const next = new Date(now.getFullYear(), d.getMonth(), d.getDate());
  if (next < new Date(now.getFullYear(), now.getMonth(), now.getDate())) next.setFullYear(now.getFullYear() + 1);
  return Math.round((next.getTime() - new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()) / 86400000);
}

// Per-teacher rollup for the teachers table + charts.
export interface TeacherRollup {
  id: string;
  name: string;
  status: string;
  students: number;
  activeStudents: number;
  revenue: number;
  teacherShare: number;
  classesLogged: number;
}

export function rollupTeachers(d: OwnerData): TeacherRollup[] {
  return d.teachers.map((t) => {
    const students = d.students.filter((s) => s.teacher_id === t.id);
    const pays = d.payments.filter((p) => p.teacher_id === t.id);
    return {
      id: t.id,
      name: t.full_name || "(unnamed)",
      status: t.status,
      students: students.length,
      activeStudents: students.filter((s) => s.status === "active").length,
      revenue: pays.reduce((a, p) => a + (p.amount_paid ?? 0), 0),
      teacherShare: pays.reduce((a, p) => a + (p.teacher_share ?? 0), 0),
      classesLogged: d.classes.filter((c) => c.teacher_id === t.id).length,
    };
  });
}

export interface OwnerKpis {
  activeStudents: number;
  totalStudents: number;
  activeTeachers: number;
  revenueMonth: number;
  companyMonth: number;
  teacherMonth: number;
  classesMonth: number;
  renewalsDue: number;
  birthdays30: number;
}

export function computeKpis(d: OwnerData): OwnerKpis {
  const monthPays = d.payments.filter((p) => inThisMonth(p.payment_date));
  const completedByStudent = new Map<string, number>();
  for (const c of d.classes) if (c.class_status === "Completed")
    completedByStudent.set(c.student_id, (completedByStudent.get(c.student_id) ?? 0) + 1);
  const renewalsDue = d.students.filter((s) => {
    if (s.status !== "active") return false;
    const remaining = (s.classes_per_month ?? 0) - (completedByStudent.get(s.id) ?? 0);
    return remaining <= 2;
  }).length;
  const birthdays30 = d.students.filter((s) => {
    const days = daysToBirthday(s.dob);
    return s.status === "active" && days !== null && days <= 30;
  }).length;
  return {
    activeStudents: d.students.filter((s) => s.status === "active").length,
    totalStudents: d.students.length,
    activeTeachers: d.teachers.filter((t) => t.status === "active").length,
    revenueMonth: monthPays.reduce((a, p) => a + (p.amount_paid ?? 0), 0),
    companyMonth: monthPays.reduce((a, p) => a + (p.company_share ?? 0), 0),
    teacherMonth: monthPays.reduce((a, p) => a + (p.teacher_share ?? 0), 0),
    classesMonth: d.classes.filter((c) => c.class_status === "Completed" && inThisMonth(c.class_date)).length,
    renewalsDue,
    birthdays30,
  };
}
