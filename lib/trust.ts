// ============================================================================
// Musicphonetics — Trust Centre content
// Credentials, operations, standards, recognition, timeline, and dashboard.
// Documents are placeholders until real certificates/PDFs are uploaded.
// TODO(content): attach real PDFs (set `file`) and live values where noted.
// ============================================================================

export type DocCategory =
  | "Business"
  | "Legal"
  | "Quality"
  | "Technology"
  | "Parents"
  | "Teachers";

export interface Credential {
  name: string;
  status: string;
  issued: string;
  category: DocCategory;
  file?: string; // PDF path, added later
}

export const CREDENTIALS: Credential[] = [
  { name: "Udyam Registration", status: "On record", issued: "—", category: "Business" },
  { name: "GST Registration", status: "On record", issued: "—", category: "Legal" },
  { name: "Trademark™", status: "On record", issued: "—", category: "Legal" },
  { name: "IEC Registration", status: "On record", issued: "—", category: "Business" },
  { name: "ISO Certification", status: "On record", issued: "—", category: "Quality" },
  { name: "DPIIT Startup Recognition", status: "On record", issued: "—", category: "Business" },
  { name: "NSIC Registration", status: "On record", issued: "—", category: "Business" },
  { name: "ZED Certification", status: "On record", issued: "—", category: "Quality" },
  { name: "GeM Government Vendor", status: "On record", issued: "—", category: "Business" },
  { name: "Google Business Verification", status: "Verified", issued: "—", category: "Technology" },
  { name: "WhatsApp Business Verification", status: "Verified", issued: "—", category: "Technology" },
];

export const CREDENTIALS_NOTE =
  "Certificates are being added to this centre. Verification documents are available on request.";

export interface OpModule {
  name: string;
  line: string;
  icon: TrustIconKey;
}

export const OPERATIONS: OpModule[] = [
  { name: "Finance", line: "Budgets, cash flow, and forecasting.", icon: "finance" },
  { name: "Accounts", line: "Invoices, ledgers, reconciliation.", icon: "accounts" },
  { name: "Tax", line: "GST and compliant filings.", icon: "tax" },
  { name: "Student Management", line: "Enrolment, cycles, and records.", icon: "student" },
  { name: "Teacher Management", line: "Onboarding, allocation, payouts.", icon: "teacher" },
  { name: "Quality Control", line: "Class audits and feedback loops.", icon: "quality" },
  { name: "Reports", line: "Operational and progress reporting.", icon: "reports" },
  { name: "Compliance", line: "Policies, safety, and standards.", icon: "compliance" },
  { name: "Customer Support", line: "Fast, accountable parent support.", icon: "support" },
  { name: "Technology", line: "Systems that scale with the company.", icon: "tech" },
];

export interface DocItem {
  title: string;
  category: DocCategory;
  type: "Certificate" | "Policy" | "Handbook" | "Framework" | "SOP" | "System";
  icon: TrustIconKey;
}

export const STANDARDS: DocItem[] = [
  { title: "Teaching Standards", category: "Teachers", type: "Framework", icon: "standards" },
  { title: "Teacher Handbook", category: "Teachers", type: "Handbook", icon: "handbook" },
  { title: "Student Handbook", category: "Parents", type: "Handbook", icon: "handbook" },
  { title: "Assessment Framework", category: "Quality", type: "Framework", icon: "assessment" },
  { title: "Attendance Policy", category: "Quality", type: "Policy", icon: "attendance" },
  { title: "Child Safety Policy", category: "Parents", type: "Policy", icon: "safety" },
  { title: "Refund Policy", category: "Legal", type: "Policy", icon: "refund" },
  { title: "Privacy Policy", category: "Legal", type: "Policy", icon: "privacy" },
  { title: "Terms & Conditions", category: "Legal", type: "Policy", icon: "terms" },
  { title: "Teacher Verification Process", category: "Teachers", type: "SOP", icon: "verify" },
  { title: "Quality Assurance Manual", category: "Quality", type: "Handbook", icon: "quality" },
  { title: "Progress Report System", category: "Parents", type: "System", icon: "reports" },
  { title: "Internal SOPs", category: "Business", type: "SOP", icon: "sop" },
];

export const DOC_CATEGORIES: DocCategory[] = [
  "Business",
  "Parents",
  "Teachers",
  "Legal",
  "Quality",
  "Technology",
];

// Combined library for the Transparency Centre search.
export interface LibraryDoc {
  title: string;
  category: DocCategory;
  kind: string;
  icon: TrustIconKey;
}

export const LIBRARY: LibraryDoc[] = [
  ...CREDENTIALS.map((c) => ({ title: c.name, category: c.category, kind: "Certificate", icon: "certificate" as TrustIconKey })),
  ...STANDARDS.map((s) => ({ title: s.title, category: s.category, kind: s.type, icon: s.icon })),
];

export interface RecognitionGroup {
  title: string;
  line: string;
  icon: TrustIconKey;
}

export const RECOGNITION: RecognitionGroup[] = [
  { title: "Media Features", line: "Newspaper and magazine coverage.", icon: "media" },
  { title: "Public Talks", line: "Talks, panels, and guest sessions.", icon: "talk" },
  { title: "Performances", line: "Recitals and live performances.", icon: "performance" },
  { title: "Institutional Work", line: "Work with schools and institutions.", icon: "institution" },
  { title: "Government Associations", line: "Recognised programmes and vendors.", icon: "gov" },
  { title: "Industry Network", line: "Partnerships across the industry.", icon: "network" },
];

export const RECOGNITION_NOTE =
  "Articles, photographs, certificates, institutional letters, and posters will be added here.";

export interface Milestone {
  year: string;
  title: string;
  body: string;
  roadmap?: boolean;
}

export const COMPANY_TIMELINE: Milestone[] = [
  { year: "2016", title: "The first students", body: "One-on-one teaching begins across Delhi NCR." },
  { year: "2018", title: "A method takes shape", body: "Patterns from real teaching become a structured system." },
  { year: "2022", title: "1,100+ students", body: "A decade of teaching children, teenagers, and adults." },
  { year: "2025", title: "Musicphonetics launches", body: "The method becomes a company with systems and standards." },
  { year: "2026", title: "Teacher network & systems", body: "Verified teachers, owner portal, and operating systems." },
  { year: "Next", title: "Cities & countries", body: "Pan-India expansion and international online learning.", roadmap: true },
];

export interface DashStat {
  label: string;
  value: string;
  status?: "ok";
}

// Illustrative values — connect to Google Sheets later.
export const DASHBOARD: DashStat[] = [
  { label: "Students taught", value: "1,100+" },
  { label: "Cities (live + roadmap)", value: "1 + 12" },
  { label: "Lessons delivered", value: "Tracked" },
  { label: "Teacher network", value: "Verified" },
  { label: "Average parent rating", value: "4.9 / 5" },
  { label: "Response time", value: "< 30 min" },
  { label: "Support satisfaction", value: "98%" },
  { label: "Document compliance", value: "100%" },
  { label: "Operational status", value: "All systems operational", status: "ok" },
];

export const DASHBOARD_NOTE =
  "Illustrative snapshot. These values connect to live data (Google Sheets / WATI) as the platform grows.";

// The 8 Trust Centre pillars (used by the homepage gateway).
export const TRUST_PILLARS: { title: string; line: string; icon: TrustIconKey }[] = [
  { title: "Company Credentials", line: "Registrations, certifications, and verifications.", icon: "certificate" },
  { title: "Business Operations", line: "Finance, compliance, support — organised to scale.", icon: "finance" },
  { title: "Standards & Documentation", line: "Handbooks, policies, and frameworks.", icon: "standards" },
  { title: "Transparency Centre", line: "A searchable library of every document.", icon: "library" },
  { title: "Public Recognition", line: "Media, performances, and institutional work.", icon: "media" },
  { title: "Company Timeline", line: "From first students to global roadmap.", icon: "timeline" },
  { title: "Trust Dashboard", line: "Live operating metrics, transparently shown.", icon: "dashboard" },
  { title: "Future Ready", line: "Built to operate internationally.", icon: "globe" },
];

// Icon keys used by the custom monochrome line-icon set.
export type TrustIconKey =
  | "finance" | "accounts" | "tax" | "student" | "teacher" | "quality"
  | "reports" | "compliance" | "support" | "tech" | "standards" | "handbook"
  | "assessment" | "attendance" | "safety" | "refund" | "privacy" | "terms"
  | "verify" | "sop" | "certificate" | "media" | "talk" | "performance"
  | "institution" | "gov" | "network" | "library" | "timeline" | "dashboard"
  | "globe";
