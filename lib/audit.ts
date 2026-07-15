"use client";

import { getSupabase } from "./supabase/client";

// Append-only operational audit. Client inserts are constrained by RLS to
// actor_id = auth.uid(); never editable/deletable from the UI. Never pass
// secrets, passwords, full bank/PAN/identity data into meta.

export const AUDIT = {
  STUDENT_CREATED: "student_created",
  STUDENT_ACTIVATED: "student_activated",
  TEACHER_APPROVED: "teacher_application_approved",
  TEACHER_ASSIGNED: "teacher_assigned",
  TEACHER_CHANGED: "teacher_changed",
  PLAN_CHANGED: "plan_changed",
  GOAL_CHANGED: "monthly_goal_changed",
  CLASS_LOGGED: "class_logged",
  ATTENDANCE_CHANGED: "attendance_changed",
  SCHEDULE_CHANGED: "schedule_changed",
  PAYMENT_VERIFIED: "payment_verified",
  PAYMENT_EDITED: "payment_edited",
  PAYOUT_PAID: "payout_marked_paid",
  REPORT_SUBMITTED: "report_submitted",
  REPORT_PUBLISHED: "report_published",
  DOCUMENT_CREATED: "document_created",
  NOTIFICATION_SENT: "notification_sent",
  PROFILE_SENSITIVE_CHANGED: "sensitive_profile_field_changed",
} as const;

export type AuditAction = (typeof AUDIT)[keyof typeof AUDIT];

export interface AuditEntry {
  action: AuditAction | string;
  summary?: string;
  entity_type?: string;
  entity_id?: string;
  student_id?: string;
  teacher_id?: string;
  meta?: Record<string, unknown>;
}

// Best-effort: an audit write must never block the actual operation.
export async function logAudit(e: AuditEntry): Promise<void> {
  try {
    const { data: { session } } = await getSupabase().auth.getSession();
    const uid = session?.user?.id;
    if (!uid) return;
    const role = (session?.user?.user_metadata?.role as string) || null;
    await getSupabase().from("audit_logs").insert({
      actor_id: uid,
      actor_role: role,
      action: e.action,
      entity_type: e.entity_type ?? null,
      entity_id: e.entity_id ?? null,
      student_id: e.student_id ?? null,
      teacher_id: e.teacher_id ?? null,
      summary: e.summary ?? null,
      meta: e.meta ?? null,
    });
  } catch {
    /* audit is best-effort */
  }
}
