// ============================================================================
// Musicphonetics - Trust Centre content
// Corporate-grade: credentials, operations, documentation, recognition,
// timeline, dashboard. Only real or in-progress credentials are shown - future
// certifications are clearly marked "Certification in Progress".
// ============================================================================

export type DocCategory =
  | "Business"
  | "Legal"
  | "Quality"
  | "Technology"
  | "Parents"
  | "Teachers"
  | "Safety";

export interface Credential {
  name: string;
  status: string;
  category: DocCategory;
  inProgress?: boolean;
  file?: string; // PDF path, added later
}

// Real (existing) verifications.
export const CREDENTIALS: Credential[] = [
  { name: "Udyam Registration", status: "Active", category: "Business" },
  { name: "GST Registration", status: "Active", category: "Legal" },
  { name: "Trademark™", status: "On record", category: "Legal" },
  { name: "IEC Registration", status: "Active", category: "Business" },
  { name: "Google Business Verification", status: "Verified", category: "Technology" },
  { name: "WhatsApp Business Verification", status: "Verified", category: "Technology" },
  // In progress - clearly marked, not claimed as received.
  { name: "DPIIT Startup Recognition", status: "Certification in Progress", category: "Business", inProgress: true },
  { name: "ISO Certification", status: "Certification in Progress", category: "Quality", inProgress: true },
  { name: "NSIC Registration", status: "Certification in Progress", category: "Business", inProgress: true },
  { name: "ZED Certification", status: "Certification in Progress", category: "Quality", inProgress: true },
  { name: "GeM Government Vendor", status: "Certification in Progress", category: "Business", inProgress: true },
];

export const CREDENTIALS_NOTE =
  "Verification documents are available on request. Certifications marked “in progress” are not yet claimed as received.";

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

// ---- Documentation (international-standard) ---------------------------------
export interface DocItem {
  title: string;
  category: DocCategory;
  icon: TrustIconKey;
  highlight?: boolean; // Child Safety / Safeguarding etc.
}

export const DOCUMENTS: DocItem[] = [
  { title: "Child Safety Policy", category: "Safety", icon: "safety", highlight: true },
  { title: "Safeguarding Policy", category: "Safety", icon: "safety", highlight: true },
  { title: "Teacher Handbook", category: "Teachers", icon: "handbook" },
  { title: "Student Handbook", category: "Parents", icon: "handbook" },
  { title: "Parent Handbook", category: "Parents", icon: "handbook" },
  { title: "Teaching Standards Manual", category: "Teachers", icon: "standards" },
  { title: "Assessment Framework", category: "Quality", icon: "assessment" },
  { title: "Attendance Policy", category: "Quality", icon: "attendance" },
  { title: "Refund Policy", category: "Legal", icon: "refund" },
  { title: "Privacy Policy", category: "Legal", icon: "privacy" },
  { title: "Terms & Conditions", category: "Legal", icon: "terms" },
  { title: "Teacher Verification Process", category: "Teachers", icon: "verify" },
  { title: "Background Verification Framework", category: "Safety", icon: "verify", highlight: true },
  { title: "Performance Review System", category: "Quality", icon: "assessment" },
  { title: "Progress Reporting Framework", category: "Parents", icon: "reports" },
  { title: "Quality Assurance Manual", category: "Quality", icon: "quality" },
  { title: "Internal SOPs", category: "Business", icon: "sop" },
  { title: "Emergency Response SOP", category: "Safety", icon: "safety", highlight: true },
  { title: "Complaint Resolution SOP", category: "Quality", icon: "sop" },
  { title: "Code of Conduct", category: "Business", icon: "compliance" },
  { title: "Data Protection Policy", category: "Technology", icon: "privacy" },
  { title: "Musicphonetics Teaching Framework", category: "Teachers", icon: "standards" },
  { title: "Risk Management Policy", category: "Business", icon: "compliance" },
  { title: "Lesson Observation Framework", category: "Quality", icon: "assessment" },
  { title: "Continuous Improvement Framework", category: "Quality", icon: "reports" },
];

export const DOC_STATUS = ["Available on request", "Reviewed annually", "Version controlled"];

// ---- Public recognition (institutional) ------------------------------------
export interface RecognitionGroup {
  title: string;
  icon: TrustIconKey;
  items: string[];
  confidential?: boolean;
}

export const RECOGNITION: RecognitionGroup[] = [
  {
    title: "Media Features",
    icon: "media",
    items: ["Newspapers", "College magazines", "University features", "Delhi-based publications", "Educational media"],
  },
  {
    title: "Public Talks",
    icon: "talk",
    items: ["Chief Judge", "IP University", "Guest sessions", "Education panels"],
  },
  {
    title: "Performances",
    icon: "performance",
    items: ["Lead Guitarist", "Acoustic Guitar", "Vocals", "Keyboard", "Live concerts", "Corporate shows", "Large stage performances"],
  },
  {
    title: "Institutional Work",
    icon: "institution",
    items: ["CBSE schools", "Army Public School experience", "Institutional music education", "Training programmes"],
  },
  {
    title: "Government Associations",
    icon: "gov",
    confidential: true,
    items: [
      "Worked with senior government institutions and public servants",
      "Trusted by defence families",
      "Worked with senior administrative professionals",
    ],
  },
];

export const PARTNERS = [
  "Raj Musicals",
  "Bhatia Musicals",
  "New Bharat Musicals",
  "Furtados",
  "Yamaha",
  "Roland",
  "Casio",
  "Kadence",
  "Vault",
];

export interface Milestone {
  year: string;
  title: string;
  body: string;
  roadmap?: boolean;
}

export const COMPANY_TIMELINE: Milestone[] = [
  { year: "2015", title: "One guitar, one student", body: "Three chords, one dream, and a desire to teach well." },
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

export const TRUST_PILLARS: { title: string; line: string; icon: TrustIconKey }[] = [
  { title: "Company Credentials", line: "Registrations, certifications, and verifications.", icon: "certificate" },
  { title: "Business Operations", line: "Finance, compliance, support - organised to scale.", icon: "finance" },
  { title: "Documentation", line: "International-standard policies and frameworks.", icon: "standards" },
  { title: "Child Safety", line: "Safeguarding and verification at the core.", icon: "safety" },
  { title: "Public Recognition", line: "Media, performances, and institutional work.", icon: "media" },
  { title: "Company Timeline", line: "From one guitar to a global roadmap.", icon: "timeline" },
  { title: "Trust Dashboard", line: "Live operating metrics, transparently shown.", icon: "dashboard" },
  { title: "Global Presence", line: "Built to operate internationally.", icon: "globe" },
];

export type TrustIconKey =
  | "finance" | "accounts" | "tax" | "student" | "teacher" | "quality"
  | "reports" | "compliance" | "support" | "tech" | "standards" | "handbook"
  | "assessment" | "attendance" | "safety" | "refund" | "privacy" | "terms"
  | "verify" | "sop" | "certificate" | "media" | "talk" | "performance"
  | "institution" | "gov" | "network" | "library" | "timeline" | "dashboard"
  | "globe";
