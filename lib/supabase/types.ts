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
  teacher_id: string;
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
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
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
