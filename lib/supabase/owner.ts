"use client";

import { getSupabase } from "./client";
import type { Profile, Student, ClassUpdate, Payment, Payout } from "./types";
import { feeBreakdown } from "@/lib/money";
import { studentPlan } from "@/lib/plan";
import { isValidCompleted } from "@/lib/attendance";

export interface OwnerData {
  teachers: Profile[];
  students: Student[];
  classes: Pick<ClassUpdate, "id" | "teacher_id" | "student_id" | "class_status" | "class_date" | "attendance_status" | "counts_toward_cycle" | "makeup_required" | "makeup_completed">[];
  payments: Payment[];
  payouts: Payout[];
  applications: { status: string }[];
  reports: { status: string }[];
  error: string | null;
}

// Owner RLS returns every row, so we aggregate on the client - robust and free
// of view/grant dependencies. Fine for early scale; can move to get_owner_stats
// RPC + server pagination later.
export async function loadOwnerData(): Promise<OwnerData> {
  const sb = getSupabase();
  const [tRes, sRes, cRes, pRes, poRes, aRes, rRes] = await Promise.all([
    sb.from("profiles").select("*").eq("role", "teacher").order("full_name"),
    sb.from("students").select("*").order("name"),
    sb.from("class_updates").select("id,teacher_id,student_id,class_status,class_date,attendance_status,counts_toward_cycle,makeup_required,makeup_completed"),
    sb.from("payments").select("*").order("payment_date", { ascending: false }),
    sb.from("payouts").select("*"),
    sb.from("teacher_applications").select("status"),   // best-effort (table may not exist)
    sb.from("student_reports").select("status"),        // best-effort (table may not exist)
  ]);
  const error =
    tRes.error?.message || sRes.error?.message || pRes.error?.message || poRes.error?.message || null;
  return {
    teachers: (tRes.data as Profile[]) ?? [],
    students: (sRes.data as Student[]) ?? [],
    classes: (cRes.data as OwnerData["classes"]) ?? [],
    payments: (pRes.data as Payment[]) ?? [],
    payouts: (poRes.data as Payout[]) ?? [],
    applications: (aRes.data as { status: string }[]) ?? [],
    reports: (rRes.data as { status: string }[]) ?? [],
    error,
  };
}

const isToday = (dateStr: string) => {
  const d = new Date(dateStr); if (isNaN(+d)) return false;
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth() && d.getDate() === n.getDate();
};
const isReceived = (p: Payment) => /received/i.test(p.payment_status);

// Rich operational metrics for the command dashboard — all from real data.
export interface OwnerOps {
  revenueToday: number;
  grossMonth: number; chargeMonth: number; netMonth: number;
  teacherNetMonth: number; companyNetMonth: number;
  outstanding: number; pendingSettlements: number; pendingPayout: number;
  revenuePrevMonth: number;
  planFoundation: number; planMain: number; planDirectors: number;
  newThisMonth: number; paused: number; unpaidThisMonth: number; noRecentUpdate: number;
  teachersWithStudents: number; teachersWithout: number; pendingApplications: number;
  classesDeliveredMonth: number;
  classesToday: number; presentToday: number; absentToday: number;
  cancelledParent: number; cancelledTeacher: number; rescheduledCount: number; noShow: number;
  makeupsPending: number; attendancePercentMonth: number;
  reportsDraft: number; reportsSubmitted: number; reportsPublished: number;
}

export function computeOps(d: OwnerData): OwnerOps {
  const monthPays = d.payments.filter((p) => inThisMonth(p.payment_date) && isReceived(p));
  let gross = 0, charge = 0, net = 0, tShare = 0, cShare = 0;
  for (const p of monthPays) {
    const f = feeBreakdown(p);
    gross += f.gross; charge += f.gatewayCharge; net += f.net; tShare += f.teacherShare; cShare += f.companyShare;
  }
  const prevKey = (() => { const d2 = new Date(); d2.setMonth(d2.getMonth() - 1); return `${d2.getFullYear()}-${d2.getMonth()}`; })();
  const revenuePrev = d.payments
    .filter((p) => isReceived(p) && `${new Date(p.payment_date).getFullYear()}-${new Date(p.payment_date).getMonth()}` === prevKey)
    .reduce((a, p) => a + (p.gross_amount ?? p.amount_paid ?? 0), 0);

  // Plans
  let f0 = 0, m0 = 0, dz = 0;
  for (const s of d.students) {
    if (s.status !== "active") continue;
    const pl = studentPlan(s);
    if (pl === "foundation") f0++; else if (pl === "main") m0++; else dz++;
  }

  // Latest class per student + unpaid/no-update
  const lastClass = new Map<string, string>();
  for (const c of d.classes) {
    const prev = lastClass.get(c.student_id);
    if (!prev || new Date(c.class_date) > new Date(prev)) lastClass.set(c.student_id, c.class_date);
  }
  const paidThisMonthStudents = new Set(monthPays.map((p) => p.student_id));
  const twoWeeksAgo = Date.now() - 14 * 86400000;
  let unpaid = 0, noUpdate = 0, newMonth = 0, paused = 0;
  for (const s of d.students) {
    if (s.created_at && inThisMonth(s.created_at)) newMonth++;
    if (s.status === "paused") paused++;
    if (s.status !== "active") continue;
    if (!paidThisMonthStudents.has(s.id)) unpaid++;
    const lc = lastClass.get(s.id);
    if (!lc || new Date(lc).getTime() < twoWeeksAgo) noUpdate++;
  }

  // Classes today + this-month attendance breakdown
  let cToday = 0, pToday = 0, aToday = 0, cancP = 0, cancT = 0, resc = 0, ns = 0, makeups = 0;
  let mPresent = 0, mAttended = 0, deliveredMonth = 0;
  for (const c of d.classes) {
    if (isToday(c.class_date)) {
      cToday++;
      if (c.attendance_status === "present" || (!c.attendance_status && c.class_status === "Completed")) pToday++;
      if (c.attendance_status === "absent") aToday++;
    }
    if (c.makeup_required && !c.makeup_completed) makeups++;
    if (inThisMonth(c.class_date)) {
      if (isValidCompleted(c)) deliveredMonth++;
      switch (c.attendance_status) {
        case "cancelled_by_parent": cancP++; break;
        case "cancelled_by_teacher": cancT++; break;
        case "rescheduled": resc++; break;
        case "no_show": ns++; break;
        case "present": mPresent++; mAttended++; break;
        case "absent": mAttended++; break;
        default: if (!c.attendance_status && c.class_status === "Completed") { mPresent++; mAttended++; }
      }
    }
  }

  const teacherStudentIds = new Set(d.students.map((s) => s.teacher_id).filter(Boolean));
  const teachersWith = d.teachers.filter((t) => teacherStudentIds.has(t.id)).length;

  return {
    revenueToday: d.payments.filter((p) => isReceived(p) && isToday(p.payment_date)).reduce((a, p) => a + (p.gross_amount ?? p.amount_paid ?? 0), 0),
    grossMonth: gross, chargeMonth: charge, netMonth: net, teacherNetMonth: tShare, companyNetMonth: cShare,
    outstanding: d.payments.reduce((a, p) => a + (p.outstanding_amount ?? 0), 0) +
      d.payments.filter((p) => /pending|partial/i.test(p.payment_status)).reduce((a, p) => a + (p.amount_paid ?? 0), 0),
    pendingSettlements: d.payments.filter((p) => p.settlement_status === "pending" && isReceived(p)).length,
    pendingPayout: d.payouts.filter((p) => p.status === "pending" || p.status === "advance_paid").reduce((a, p) => a + (p.balance ?? 0), 0),
    revenuePrevMonth: revenuePrev,
    planFoundation: f0, planMain: m0, planDirectors: dz,
    newThisMonth: newMonth, paused, unpaidThisMonth: unpaid, noRecentUpdate: noUpdate,
    teachersWithStudents: teachersWith, teachersWithout: d.teachers.length - teachersWith,
    pendingApplications: d.applications.filter((a) => a.status === "pending").length,
    classesDeliveredMonth: deliveredMonth,
    classesToday: cToday, presentToday: pToday, absentToday: aToday,
    cancelledParent: cancP, cancelledTeacher: cancT, rescheduledCount: resc, noShow: ns,
    makeupsPending: makeups, attendancePercentMonth: mAttended > 0 ? Math.round((mPresent / mAttended) * 100) : 0,
    reportsDraft: d.reports.filter((r) => r.status === "draft").length,
    reportsSubmitted: d.reports.filter((r) => r.status === "submitted").length,
    reportsPublished: d.reports.filter((r) => r.status === "published").length,
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
  for (const c of d.classes) if (isValidCompleted(c))
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
    classesMonth: d.classes.filter((c) => isValidCompleted(c) && inThisMonth(c.class_date)).length,
    renewalsDue,
    birthdays30,
  };
}
