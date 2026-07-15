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
// Clients cannot insert into audit_logs directly (no RLS insert policy). We call
// the SECURITY DEFINER function public.mp_audit, which pins actor_id/actor_role
// to the caller's real identity so entries cannot be fabricated or impersonated.
export async function logAudit(e: AuditEntry): Promise<void> {
  try {
    await getSupabase().rpc("mp_audit", {
      p_action: e.action,
      p_entity_type: e.entity_type ?? null,
      p_entity_id: e.entity_id ?? null,
      p_student_id: e.student_id ?? null,
      p_teacher_id: e.teacher_id ?? null,
      p_summary: e.summary ?? null,
      p_meta: e.meta ?? null,
    });
  } catch {
    /* audit is best-effort */
  }
}
