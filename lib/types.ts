// ============================================================================
// Musicphonetics — Shared TypeScript Types
// CRM data model + content model. Used by mock data today, integration-ready
// for Google Sheets / Apps Script / Supabase later.
// ============================================================================

// ---- Marketing attribution sources -----------------------------------------
export type LeadSource =
  | "Instagram"
  | "Facebook"
  | "Google Search"
  | "Website"
  | "ChatGPT / AI"
  | "YouTube"
  | "Justdial"
  | "Friend / Family"
  | "School"
  | "Teacher"
  | "Returning Student"
  | "Other";

export const LEAD_SOURCES: LeadSource[] = [
  "Instagram",
  "Facebook",
  "Google Search",
  "Website",
  "ChatGPT / AI",
  "YouTube",
  "Justdial",
  "Friend / Family",
  "School",
  "Teacher",
  "Returning Student",
  "Other",
];

export type BrandAwareness = "Familiar" | "Wants to know more";

export type InterestType =
  | "For my child"
  | "For myself"
  | "For a family member"
  | "Group / Academy";

export type RecommendedPath =
  | "A · The Foundation"
  | "B · The Transformation"
  | "C · The Director's Circle"
  | "Trinity Preparation"
  | "Group / Academy (waitlist)";

export type LeadStatus =
  | "New"
  | "Contacted"
  | "Qualified"
  | "Recommended"
  | "Converted"
  | "Lost";

export type PaymentStatus = "Unpaid" | "Partial" | "Paid" | "Overdue";

// ---- Person (lead / CRM contact) --------------------------------------------
export interface Person {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  leadSource: LeadSource;
  brandAwareness: BrandAwareness;
  interestType: InterestType;
  instrument: string;
  area: string;
  experience: string;
  goal: string;
  recommendedPath: RecommendedPath | "";
  selectedPackage: string;
  currentStatus: LeadStatus;
  assignedTeacher: string;
  paymentStatus: PaymentStatus;
  classesRemaining: number;
  notes: string;
}

// ---- Student ----------------------------------------------------------------
export type StudentStatus = "Active" | "Paused" | "Renewal Due" | "Inactive";

export interface Student {
  id: string;
  name: string;
  parentName: string;
  phone: string;
  teacher: string;
  instrument: string;
  packageName: string;
  classesPurchased: number;
  classesDone: number;
  joiningDate: string;
  renewalDate: string;
  feePaid: number;
  balance: number;
  status: StudentStatus;
}

// ---- Teacher ----------------------------------------------------------------
export type VerificationStatus = "Verified" | "In Review" | "Pending";

export interface Teacher {
  id: string;
  name: string;
  instruments: string[];
  areas: string[];
  maxStudents: number;
  currentStudents: number;
  rating: number;
  active: boolean;
  verificationStatus: VerificationStatus;
  // Public profile fields (Teachers page)
  experience?: string;
  qualification?: string;
  bio?: string;
}

// ---- Payment ----------------------------------------------------------------
export type PaymentMode = "UPI" | "Bank Transfer" | "Cash" | "Card";

export interface Payment {
  id: string;
  date: string;
  student: string;
  amount: number;
  packageName: string;
  mode: PaymentMode;
  status: PaymentStatus;
  invoice: string;
}

// ---- Class log --------------------------------------------------------------
export type ClassStatus = "Scheduled" | "Completed" | "Cancelled" | "No-show";

export interface ClassLog {
  id: string;
  date: string;
  student: string;
  teacher: string;
  instrument: string;
  classNumber: number;
  duration: number; // minutes
  status: ClassStatus;
  remarks: string;
}

// ---- Public content model ---------------------------------------------------
export interface Package {
  key: string;
  name: string;
  tagline: string;
  /** e.g. "from ₹12,000" or "By application". */
  priceFrom: string;
  /** e.g. "/month · 8 classes" or "limited seats · from ₹20,000/mo". */
  unit: string;
  bullets: string[];
  featured?: boolean;
  premium?: boolean;
  badge?: string;
  application?: boolean;
}

export type ReviewRole = "Parent" | "Student";

export interface Review {
  /** Display name. For minors: first name + last initial only. */
  name: string;
  quote: string;
  role: ReviewRole;
  /** Broad locality only (no building names, per child-safety policy). */
  area: string;
  rating: number;
  /** This quote resolves the price/fee objection. */
  onFees?: boolean;
  /** A serving / retired defence officer family (Delhi Cantonment). */
  defence?: boolean;
  /** Student age — only present for `role: "Student"` (all minors). */
  age?: number;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProgramCard {
  title: string;
  description: string;
  status: "Current" | "Exam pathway" | "Coming as demand grows" | "Seasonal";
}
