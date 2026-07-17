import type { OnboardingStatus, TeacherOnboardingItem } from "./supabase/types";

// ---- Validators (used both to gate saves and to show inline errors) --------
export const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, ""));
export const validPAN = (v: string) => /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(v.trim().toUpperCase());
export const validIFSC = (v: string) => /^[A-Z]{4}0[A-Z0-9]{6}$/.test(v.trim().toUpperCase());
export const validUPI = (v: string) => /^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(v.trim());
export const validURL = (v: string) => /^https?:\/\/\S+\.\S+/.test(v.trim());
export const validPIN = (v: string) => /^\d{6}$/.test(v.trim());
export const validAccount = (v: string) => /^\d{6,20}$/.test(v.replace(/\s/g, ""));
export const MIN_BIO = 120;

// ---- Masking (never render full sensitive values) --------------------------
export const maskAccount = (num?: string | null) => {
  const d = (num || "").replace(/\D/g, "");
  return d ? "•".repeat(Math.max(d.length - 4, 2)) + d.slice(-4) : "—";
};
export const maskPan = (pan?: string | null) => {
  const p = (pan || "").trim().toUpperCase();
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/.test(p) ? `${p.slice(0, 3)}•••${p.slice(-4)}` : "—";
};

// ---- Item catalog: how each item maps to a profile section + UI copy --------
export type ProfileSection = "personal" | "teaching" | "availability" | "banking" | "compliance" | "media";

export interface ItemMeta {
  key: string;
  label: string;
  section: ProfileSection;
  action: string;   // contextual button text when the item still needs work
}

export const ITEM_META: Record<string, ItemMeta> = {
  profile_photo:         { key: "profile_photo", label: "Profile photo", section: "media", action: "Upload photo" },
  legal_name:            { key: "legal_name", label: "Full legal name", section: "personal", action: "Add details" },
  phone:                 { key: "phone", label: "Phone", section: "personal", action: "Add details" },
  address:               { key: "address", label: "Address", section: "personal", action: "Complete address" },
  instruments:           { key: "instruments", label: "Instruments", section: "teaching", action: "Add details" },
  regions:               { key: "regions", label: "Teaching regions", section: "teaching", action: "Add details" },
  experience:            { key: "experience", label: "Years of experience", section: "teaching", action: "Add details" },
  qualifications:        { key: "qualifications", label: "Qualifications", section: "teaching", action: "Add details" },
  biography:             { key: "biography", label: "Biography", section: "teaching", action: "Write biography" },
  availability:          { key: "availability", label: "Availability", section: "availability", action: "Add availability" },
  bank_account:          { key: "bank_account", label: "Bank account", section: "banking", action: "Add bank details" },
  ifsc:                  { key: "ifsc", label: "IFSC", section: "banking", action: "Add bank details" },
  upi:                   { key: "upi", label: "UPI ID", section: "banking", action: "Add UPI" },
  pan:                   { key: "pan", label: "PAN", section: "banking", action: "Add PAN" },
  identity_verification: { key: "identity_verification", label: "Identity verification", section: "compliance", action: "Upload document" },
  bank_proof:            { key: "bank_proof", label: "Cancelled cheque / bank proof", section: "compliance", action: "Upload document" },
  safeguarding:          { key: "safeguarding", label: "Safeguarding declaration", section: "compliance", action: "Review and acknowledge" },
  joining_agreement:     { key: "joining_agreement", label: "Joining Agreement", section: "compliance", action: "Review and acknowledge" },
  demo_video:            { key: "demo_video", label: "Demo / performance link", section: "media", action: "Add link" },
};

export const metaFor = (key: string): ItemMeta =>
  ITEM_META[key] ?? { key, label: key.replace(/_/g, " "), section: "personal", action: "Add details" };

// ---- Status → teacher-facing copy (no self-approval anywhere) ---------------
export function statusCopy(it: Pick<TeacherOnboardingItem, "status" | "rejection_reason">): { label: string; tone: "pending" | "submitted" | "approved" | "rejected" | "muted" } {
  switch (it.status) {
    case "approved": return { label: "Approved", tone: "approved" };
    case "submitted": return { label: "Awaiting owner review", tone: "submitted" };
    case "rejected": return { label: it.rejection_reason ? `Changes requested: ${it.rejection_reason}` : "Changes requested", tone: "rejected" };
    case "not_required": return { label: "Not required", tone: "muted" };
    default: return { label: "Pending", tone: "pending" };
  }
}

// ---- Completion / readiness -------------------------------------------------
const DONE: OnboardingStatus[] = ["approved", "not_required"];
const ENTERED: OnboardingStatus[] = ["submitted", "approved", "not_required"];

export type OnboardingState = "ready" | "verification_in_progress" | "changes_requested" | "action_required";

export interface Completion {
  requiredTotal: number;
  requiredEntered: number;   // submitted or approved or not_required
  requiredApproved: number;  // approved or not_required
  profilePct: number;        // required info entered
  verificationPct: number;   // required info owner-approved
  ready: boolean;            // every required item approved/not_required
  state: OnboardingState;
}

export function completion(items: TeacherOnboardingItem[]): Completion {
  const required = items.filter((i) => i.required_before_assignment);
  const total = required.length || 1;
  const entered = required.filter((i) => ENTERED.includes(i.status)).length;
  const approved = required.filter((i) => DONE.includes(i.status)).length;
  const ready = required.length > 0 && required.every((i) => DONE.includes(i.status));
  const anyRejected = required.some((i) => i.status === "rejected");
  const anySubmitted = required.some((i) => i.status === "submitted");
  const state: OnboardingState = ready
    ? "ready"
    : anyRejected ? "changes_requested"
    : anySubmitted ? "verification_in_progress"
    : "action_required";
  return {
    requiredTotal: required.length,
    requiredEntered: entered,
    requiredApproved: approved,
    profilePct: Math.round((entered / total) * 100),
    verificationPct: Math.round((approved / total) * 100),
    ready,
    state,
  };
}

export const STATE_COPY: Record<OnboardingState, { label: string; tone: "green" | "gold" | "red" | "ink" }> = {
  ready: { label: "Ready for assignment", tone: "green" },
  verification_in_progress: { label: "Verification in progress", tone: "gold" },
  changes_requested: { label: "Changes requested", tone: "red" },
  action_required: { label: "Action required", tone: "ink" },
};
