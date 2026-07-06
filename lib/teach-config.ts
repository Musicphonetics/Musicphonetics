// ============================================================================
// Musicphonetics — "Teach With Us" page configuration.
// Every owner-tunable number and every claim lives here so the page stays
// honest and easy to update. Set the values marked OWNER: before/after launch.
// ============================================================================

// --- Owner-tunable money variables --------------------------------------
// Kept null until confirmed. When null, the page renders honestly WITHOUT a
// fabricated figure ("a one-time bonus", "a defined sum"). Set a number to show it.
export const REFERRAL_BONUS: number | null = null; // OWNER: e.g. 5000
export const BREACH_DAMAGES: number | null = null; // OWNER: lawyer-set, enforceable, non-penal
export const AVG_BONUS = 5000; // OWNER: modest illustrative monthly bonus for the calculator toggle

// --- Calculator bounds (the 70/30 split is fixed everywhere) -------------
export const TEACHER_SHARE = 0.7;
export const FEE_MIN = 6000;
export const FEE_MAX = 18000;
export const FEE_DEFAULT = 10000;
export const STUDENTS_MIN = 1;
export const STUDENTS_MAX = 25;
export const STUDENTS_DEFAULT = 8;
// Roster sizes shown as bars in the "income by student count" chart.
export const CHART_STUDENT_STEPS = [2, 4, 8, 15, 20];

// --- Proof strip ---------------------------------------------------------
export const PROOF_STATS: { value: string; label: string }[] = [
  { value: "10+", label: "Years" },
  { value: "1,100+", label: "Students taught" },
  { value: "200+", label: "Trinity exam passes" },
  { value: "12", label: "Instruments" },
  { value: "NCR + online", label: "Reach" },
];

// --- Ecosystem cards ("you can't do this alone") -------------------------
export interface EcoCard {
  icon: "network" | "leads" | "space" | "feature" | "gear" | "stage" | "grow" | "globe";
  title: string;
  body: string;
}

export const ECOSYSTEM: EcoCard[] = [
  {
    icon: "network",
    title: "A student network waiting for you",
    body: "A decade of demand across Delhi NCR. You're handed students — you don't hunt for them.",
  },
  {
    icon: "leads",
    title: "We pay for the leads, not you",
    body: "Active partnerships with JustDial and UrbanPro mean you never spend a rupee on discovery.",
  },
  {
    icon: "space",
    title: "Spaces are sorted",
    body: "Tie-ups with jam pads and studios across the city for sessions that need a room.",
  },
  {
    icon: "feature",
    title: "You get featured",
    body: "Our Instagram, YouTube, WhatsApp channel and website put our teachers in front of a real audience.",
  },
  {
    icon: "gear",
    title: "Instrument partners",
    body: "Tie-ups with music retailers — gear, deals and visibility for our faculty.",
  },
  {
    icon: "stage",
    title: "Stage time",
    body: "Quarterly student showcases and a flagship annual event with celebrity musicians — in the pipeline as we scale.",
  },
  {
    icon: "grow",
    title: "Grow your own craft",
    body: "Trainings, workshops and seminars in the pipeline — keep levelling up while you teach.",
  },
  {
    icon: "globe",
    title: "Going global",
    body: "Musicphonetics is building beyond national borders. Early faculty grow with it.",
  },
];

// Partner + social slots. Fill `logo`/`handle` when assets are ready; empty
// entries hide themselves — never an empty box, never "coming soon".
export const PARTNER_SLOTS: { name: string; note: string }[] = [
  { name: "JustDial", note: "Lead partner" },
  { name: "UrbanPro", note: "Lead partner" },
  { name: "Studios & jam pads", note: "Space partners" },
  { name: "Instrument retailers", note: "Gear partners" },
];

// --- Scope of work -------------------------------------------------------
export const SCOPE: { n: number; text: string; note?: string }[] = [
  { n: 1, text: "Deliver excellent one-to-one lessons — at home, online, or at our centre — to the students assigned to you." },
  { n: 2, text: "Follow the Musicphonetics graded method and the Trinity pathway." },
  { n: 3, text: "Update the class sheet daily — attendance, what was taught, homework, next class.", note: "Non-negotiable." },
  { n: 4, text: "Maintain professional, safe conduct at all times. Safeguarding standards apply." },
  { n: 5, text: "Never handle fees, discounts or refunds — the office does. You teach." },
  { n: 6, text: "Communicate any schedule change in advance." },
];

// --- Growth ladder -------------------------------------------------------
export const LADDER: { rung: string; title: string; body: string }[] = [
  { rung: "01", title: "Faculty", body: "Teach, earn 70%, and get featured across our channels." },
  { rung: "02", title: "Senior Faculty", body: "Priority student allocation, higher bonuses, and showcase billing." },
  { rung: "03", title: "Regional Coordinator", body: "After ~6 months of strong delivery, help run a region — and earn an override on the teachers you support and onboard. This is the one and only override layer." },
  { rung: "04", title: "Partner track", body: "As we expand nationally and internationally, early coordinators grow into partnership roles." },
];

// --- Payouts -------------------------------------------------------------
export const PAYOUTS: { title: string; body: string }[] = [
  { title: "70% to you, 30% to us", body: "A transparent split with no hidden cuts. Fees vary by student and arrangement — the split never does." },
  { title: "Paid on a fixed monthly cycle", body: "Against your daily-updated, confirmed class records. No chasing parents for money." },
  { title: "Direct to bank or UPI", body: "With a payslip-style summary every cycle, so you always know exactly what you earned and why." },
  { title: "Monthly performance bonuses", body: "On top of your share — for attendance, retention, and student results." },
];

// --- Terms at a glance (full clauses live on /teach-with-us/terms) --------
export const TERMS_GLANCE: string[] = [
  "70/30 split — your 70%, fees variable, the split fixed.",
  "Daily class-sheet update is required.",
  "Safeguarding & code of conduct are binding.",
  "6-month non-solicitation of our students/parents on exit — breach triggers liquidated damages.",
];

// --- Teacher FAQ ---------------------------------------------------------
export const TEACH_FAQ: { q: string; a: string }[] = [
  { q: "Do I get students, or find my own?", a: "You're given students. A decade of demand across Delhi NCR means we hand you a roster and keep it full — that's our job, not yours." },
  { q: "How much can I earn?", a: "You keep 70% of every fee. Use the calculator above to see what different roster sizes and fees add up to — all figures are illustrative estimates, not guarantees." },
  { q: "When am I paid?", a: "On a fixed monthly cycle, direct to your bank or UPI, against your daily-logged class records — with a payslip-style summary each cycle." },
  { q: "Do I pay for anything?", a: "No. We pay for the leads, the spaces, the brand and the systems. You bring your teaching." },
  { q: "What is the class sheet?", a: "A short daily update — attendance, what was taught, homework, next class. It's how we protect students, prove delivery, and pay you correctly. It's the one non-negotiable." },
  { q: "Can I teach elsewhere?", a: "While engaged with us, you may teach your own separate students — but not ours. On exit, a 6-month non-solicitation on our students and parents applies. Full terms are published." },
  { q: "What instruments and areas?", a: "Twelve instruments across guitar, piano, vocals, drums, violin, ukulele and more — at home across Delhi NCR, online anywhere, or at our South Delhi centre." },
  { q: "What's the growth path?", a: "Faculty → Senior Faculty → Regional Coordinator → Partner track. Real progression tied to delivery, with a single management override layer at the coordinator stage." },
];

export const INSTRUMENTS: string[] = [
  "Guitar", "Piano", "Keyboard", "Vocals (Western)", "Vocals (Hindustani)",
  "Ukulele", "Drums", "Cajon", "Violin", "Music Theory",
  "Grade Preparation", "Performance Coaching",
];
