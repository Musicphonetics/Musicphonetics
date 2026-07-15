// Row shapes for the Teacher OS tables. Money is integer rupees.

export type Role = "owner" | "teacher" | "parent";

export interface Profile {
  id: string;
  role: Role;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  instruments: string[] | null;
  regions: string[] | null;
  experience_years: number | null;
  qualifications: string | null;
  preferred_modes: string[] | null;
  bank_upi: string | null;
  status: "active" | "inactive" | "blacklisted";
  blacklist_until: string | null;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Student {
  id: string;
  student_code?: string | null; // MP-YYYY-000001, generated server-side
  teacher_id: string;
  parent_id?: string | null; // linked auth user (the family login)
  name: string;
  dob: string | null;
  school: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  parent_email: string | null;
  area: string | null;
  address: string | null;
  instrument: string | null;
  level: string | null;
  learning_goal: string | null;
  student_profile: string | null;
  class_mode: string | null;
  class_day: string | null;
  class_time: string | null;
  fee_quoted: number | null;
  classes_per_month: number | null;
  start_date: string | null;
  status: "active" | "paused" | "left" | "trial";
  media_consent: boolean | null;
  birthday_gift_notes: string | null;
  notes: string | null;
  // Plan (batch) + rolling monthly goal. Optional: columns added by
  // supabase/student_plan_goals.sql; older rows / pre-migration read undefined.
  plan?: "foundation" | "main" | "directors" | null;
  monthly_goal?: string | null;
  goal_month?: string | null;
  goal_set_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type AttendanceStatus =
  | "scheduled" | "present" | "absent" | "cancelled_by_parent"
  | "cancelled_by_teacher" | "rescheduled" | "holiday" | "no_show";

export interface ClassUpdate {
  id: string;
  teacher_id: string;
  student_id: string;
  class_date: string;
  class_status: "Completed" | "Rescheduled" | "Cancelled" | "No-Show";
  class_number: number | null;
  duration_min: number | null;
  taught: string | null;
  homework: string | null;
  student_response: string | null;
  parent_feedback: string | null;
  next_class_date: string | null;
  teacher_notes: string | null;
  // Attendance & class accounting (musicphonetics_operations_upgrade.sql)
  attendance_status?: AttendanceStatus | null;
  scheduled_start?: string | null;
  scheduled_end?: string | null;
  actual_start?: string | null;
  actual_end?: string | null;
  rescheduled_to?: string | null;
  counts_toward_cycle?: boolean | null;
  makeup_required?: boolean | null;
  makeup_completed?: boolean | null;
  parent_reason?: string | null;
  last_modified_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  teacher_id: string;
  student_id: string;
  payment_date: string;
  billing_cycle: string | null;
  fee_quoted: number | null;
  amount_paid: number;
  teacher_share: number; // generated
  company_share: number; // generated
  payment_status: "Received" | "Pending" | "Partial" | "Refunded";
  payment_mode: string;
  cashfree_bill_no: string | null;
  txn_reference: string | null;
  notes: string | null;
  // Invoices, receipts & settlement (musicphonetics_operations_upgrade.sql)
  invoice_number?: string | null;
  receipt_number?: string | null;
  razorpay_order_id?: string | null;
  razorpay_payment_id?: string | null;
  gateway_txn_id?: string | null;
  gross_amount?: number | null;
  gateway_charge?: number | null;
  gateway_charge_estimated?: boolean | null;
  net_amount?: number | null;
  settlement_status?: "pending" | "settled" | "on_hold" | null;
  settlement_date?: string | null;
  payment_cycle?: string | null;
  classes_included?: number | null;
  renewal_due_date?: string | null;
  outstanding_amount?: number | null;
  discount?: number | null;
  verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

// ---- Operations upgrade tables --------------------------------------------

export type NotificationType =
  | "class_reminder" | "homework_added" | "class_rescheduled" | "class_cancelled"
  | "payment_due" | "payment_received" | "monthly_report_ready" | "teacher_assigned"
  | "teacher_changed" | "director_message" | "general_announcement";

export interface Notification {
  id: string;
  recipient_id: string;
  role: Role | null;
  type: NotificationType;
  title: string;
  body: string | null;
  action_url: string | null;
  entity_type: string | null;
  entity_id: string | null;
  is_read: boolean;
  must_ack: boolean;
  acked_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
}

export interface TeacherAvailability {
  id: string;
  teacher_id: string;
  weekday: number; // 0 = Sunday
  start_time: string;
  end_time: string;
  mode: string | null;
  active: boolean;
  created_at: string;
}

export interface TeacherTimeOff {
  id: string;
  teacher_id: string;
  start_date: string;
  end_date: string;
  reason: string | null;
  created_at: string;
}

export interface ScheduledClass {
  id: string;
  teacher_id: string;
  student_id: string;
  scheduled_date: string;
  start_time: string;
  end_time: string;
  mode: string | null;
  location: string | null;
  status: AttendanceStatus;
  rescheduled_to: string | null;
  class_update_id: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface Holiday {
  id: string;
  holiday_date: string;
  name: string | null;
  created_at: string;
}

export type DocumentVisibility = "owner_only" | "owner_teacher" | "parent_visible";
export type DocumentType =
  | "enrolment_confirmation" | "enrolment_agreement" | "invoice" | "receipt"
  | "monthly_report" | "progress_report" | "certificate" | "uploaded_document" | "internal_document";

export interface StudentDocument {
  id: string;
  student_id: string;
  type: DocumentType;
  title: string;
  visibility: DocumentVisibility;
  document_url: string | null;
  storage_path: string | null;
  internal_route: string | null;
  generated: boolean;
  created_by: string | null;
  created_at: string;
}

export type OnboardingStatus = "pending" | "submitted" | "approved" | "rejected" | "not_required";

export interface TeacherOnboardingItem {
  id: string;
  teacher_id: string;
  item_key: string;
  label: string;
  status: OnboardingStatus;
  required_before_assignment: boolean;
  notes: string | null;
  rejection_reason: string | null;
  evidence_url: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportStatus = "draft" | "submitted" | "published";

export interface StudentReport {
  id: string;
  student_id: string;
  teacher_id: string;
  report_month: string; // YYYY-MM
  plan: string | null;
  instrument: string | null;
  classes_scheduled: number | null;
  classes_completed: number | null;
  attendance_percent: number | null;
  topics_covered: string | null;
  skills_improved: string | null;
  homework_completion: string | null;
  teacher_comments: string | null;
  current_goal: string | null;
  goal_outcome: string | null;
  next_goal: string | null;
  attention_areas: string | null;
  director_note: string | null;
  status: ReportStatus;
  submitted_at: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentReportTopic {
  id: string;
  report_id: string;
  topic: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_id: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  student_id: string | null;
  teacher_id: string | null;
  summary: string | null;
  meta: Record<string, unknown> | null;
  created_at: string;
}

export interface Payout {
  id: string;
  teacher_id: string;
  period: string | null;
  total_earned: number;
  advance_paid: number;
  balance: number; // generated
  last_paid: string | null;
  status: "pending" | "advance_paid" | "settled" | "on_hold";
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentStat {
  student_id: string;
  student_code?: string | null;
  teacher_id: string;
  name: string;
  instrument: string | null;
  level: string | null;
  status: string;
  dob: string | null;
  classes_per_month: number | null;
  fee_quoted: number | null;
  classes_completed: number;
  classes_remaining: number;
  total_paid: number;
  teacher_share_total: number;
}

export interface OwnerStats {
  active_students: number;
  total_students: number;
  active_teachers: number;
  revenue_month: number;
  company_share_month: number;
  teacher_share_month: number;
  pending_balance: number;
  classes_completed_month: number;
  renewals_due: number;
  birthdays_30d: number;
}
