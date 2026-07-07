// ============================================================================
// Musicphonetics - Mock CRM Data
// Local mock data for the admin portal. Integration-ready: swap these exports
// for a data layer backed by Google Sheets / Apps Script / Supabase later.
//
// TODO(integration): replace the const arrays below with async fetchers, e.g.
//   export async function getPeople(): Promise<Person[]> { ... }
// keeping the same return types so admin components don't change.
// ============================================================================

import type {
  ClassLog,
  Payment,
  Person,
  Student,
  Teacher,
} from "./types";
import { LEAD_SOURCES } from "./types";

// ---- People / Leads ---------------------------------------------------------
export const MOCK_PEOPLE: Person[] = [
  {
    id: "P-1001",
    createdAt: "2026-06-25T09:12:00Z",
    updatedAt: "2026-06-25T09:40:00Z",
    name: "Riya Sharma",
    phone: "+91 98xxxxxx21",
    leadSource: "Instagram",
    brandAwareness: "Wants to know more",
    interestType: "For my child",
    instrument: "Piano",
    area: "South Delhi",
    experience: "Beginner",
    goal: "Structured foundation for an 8-year-old",
    recommendedPath: "B · The Transformation",
    selectedPackage: "B · The Transformation",
    currentStatus: "Recommended",
    assignedTeacher: "Placeholder · Teacher Two",
    paymentStatus: "Unpaid",
    classesRemaining: 0,
    notes: "Prefers weekday evenings. Keen on Trinity later.",
  },
  {
    id: "P-1002",
    createdAt: "2026-06-25T10:02:00Z",
    updatedAt: "2026-06-25T10:20:00Z",
    name: "Aditya Verma",
    phone: "+91 99xxxxxx08",
    leadSource: "Google Search",
    brandAwareness: "Familiar",
    interestType: "For myself",
    instrument: "Guitar",
    area: "Gurugram",
    experience: "Some experience",
    goal: "Improve technique and learn repertoire",
    recommendedPath: "A · The Foundation",
    selectedPackage: "",
    currentStatus: "Qualified",
    assignedTeacher: "",
    paymentStatus: "Unpaid",
    classesRemaining: 0,
    notes: "Adult learner, weekends only.",
  },
  {
    id: "P-1003",
    createdAt: "2026-06-24T14:30:00Z",
    updatedAt: "2026-06-25T08:05:00Z",
    name: "Neha Gupta",
    phone: "+91 98xxxxxx55",
    leadSource: "Friend / Family",
    brandAwareness: "Familiar",
    interestType: "For my child",
    instrument: "Vocals (Western)",
    area: "Noida",
    experience: "Beginner",
    goal: "Build confidence and healthy technique",
    recommendedPath: "B · The Transformation",
    selectedPackage: "B · The Transformation",
    currentStatus: "Converted",
    assignedTeacher: "Placeholder · Teacher Three",
    paymentStatus: "Paid",
    classesRemaining: 6,
    notes: "Joined this month. Very engaged parent.",
  },
  {
    id: "P-1004",
    createdAt: "2026-06-24T11:15:00Z",
    updatedAt: "2026-06-24T19:00:00Z",
    name: "Karan Mehta",
    phone: "+91 97xxxxxx77",
    leadSource: "YouTube",
    brandAwareness: "Wants to know more",
    interestType: "For a family member",
    instrument: "Drums",
    area: "Faridabad",
    experience: "Beginner",
    goal: "Younger brother wants to start drums",
    recommendedPath: "A · The Foundation",
    selectedPackage: "",
    currentStatus: "Contacted",
    assignedTeacher: "",
    paymentStatus: "Unpaid",
    classesRemaining: 0,
    notes: "Awaiting confirmation on schedule.",
  },
  {
    id: "P-1005",
    createdAt: "2026-06-23T16:45:00Z",
    updatedAt: "2026-06-25T07:30:00Z",
    name: "Simran Kaur",
    phone: "+91 98xxxxxx12",
    leadSource: "Justdial",
    brandAwareness: "Wants to know more",
    interestType: "For my child",
    instrument: "Violin",
    area: "South Delhi",
    experience: "Beginner",
    goal: "Serious classical training",
    recommendedPath: "C · The Director's Circle",
    selectedPackage: "C · The Director's Circle",
    currentStatus: "Recommended",
    assignedTeacher: "Placeholder · Teacher Five",
    paymentStatus: "Partial",
    classesRemaining: 0,
    notes: "Interested in the Director's Circle. Booking a slot.",
  },
  {
    id: "P-1006",
    createdAt: "2026-06-23T09:00:00Z",
    updatedAt: "2026-06-23T12:00:00Z",
    name: "Mohit Yadav",
    phone: "+91 96xxxxxx33",
    leadSource: "Facebook",
    brandAwareness: "Wants to know more",
    interestType: "Group / Academy",
    instrument: "Guitar",
    area: "Ghaziabad",
    experience: "Beginner",
    goal: "Interested in a future group batch",
    recommendedPath: "Group / Academy (waitlist)",
    selectedPackage: "",
    currentStatus: "New",
    assignedTeacher: "",
    paymentStatus: "Unpaid",
    classesRemaining: 0,
    notes: "Added to academy interest waitlist.",
  },
  {
    id: "P-1007",
    createdAt: "2026-06-25T08:20:00Z",
    updatedAt: "2026-06-25T08:55:00Z",
    name: "Ananya Iyer",
    phone: "+91 90xxxxxx44",
    leadSource: "Website",
    brandAwareness: "Familiar",
    interestType: "For myself",
    instrument: "Piano",
    area: "Online",
    experience: "Intermediate",
    goal: "Trinity Grade 5 preparation",
    recommendedPath: "Trinity Preparation",
    selectedPackage: "B · The Transformation",
    currentStatus: "Qualified",
    assignedTeacher: "",
    paymentStatus: "Unpaid",
    classesRemaining: 0,
    notes: "Wants exam pathway. Flexible timing.",
  },
  {
    id: "P-1008",
    createdAt: "2026-06-22T13:10:00Z",
    updatedAt: "2026-06-24T10:00:00Z",
    name: "Rohit Bansal",
    phone: "+91 98xxxxxx99",
    leadSource: "Returning Student",
    brandAwareness: "Familiar",
    interestType: "For myself",
    instrument: "Guitar",
    area: "Gurugram",
    experience: "Advanced",
    goal: "Restart lessons after a break",
    recommendedPath: "C · The Director's Circle",
    selectedPackage: "C · The Director's Circle",
    currentStatus: "Converted",
    assignedTeacher: "Placeholder · Teacher One",
    paymentStatus: "Paid",
    classesRemaining: 5,
    notes: "Returning student. Direct to Director's Circle.",
  },
];

// ---- Students ---------------------------------------------------------------
export const MOCK_STUDENTS: Student[] = [
  {
    id: "S-2001",
    name: "Aarav Gupta",
    parentName: "Neha Gupta",
    phone: "+91 98xxxxxx55",
    teacher: "Placeholder · Teacher Three",
    instrument: "Vocals (Western)",
    packageName: "B · The Transformation",
    classesPurchased: 8,
    classesDone: 2,
    joiningDate: "2026-06-10",
    renewalDate: "2026-07-10",
    feePaid: 12000,
    balance: 0,
    status: "Active",
  },
  {
    id: "S-2002",
    name: "Rohit Bansal",
    parentName: "-",
    phone: "+91 98xxxxxx99",
    teacher: "Placeholder · Teacher One",
    instrument: "Guitar",
    packageName: "C · The Director's Circle",
    classesPurchased: 8,
    classesDone: 3,
    joiningDate: "2026-06-05",
    renewalDate: "2026-07-05",
    feePaid: 20000,
    balance: 0,
    status: "Active",
  },
  {
    id: "S-2003",
    name: "Ishita Rao",
    parentName: "Meera Rao",
    phone: "+91 98xxxxxx10",
    teacher: "Placeholder · Teacher Two",
    instrument: "Piano",
    packageName: "A · The Foundation",
    classesPurchased: 8,
    classesDone: 7,
    joiningDate: "2026-05-20",
    renewalDate: "2026-06-28",
    feePaid: 9600,
    balance: 0,
    status: "Renewal Due",
  },
  {
    id: "S-2004",
    name: "Vivaan Sethi",
    parentName: "Anil Sethi",
    phone: "+91 98xxxxxx62",
    teacher: "Placeholder · Teacher Four",
    instrument: "Drums",
    packageName: "B · The Transformation",
    classesPurchased: 8,
    classesDone: 4,
    joiningDate: "2026-06-01",
    renewalDate: "2026-07-01",
    feePaid: 6000,
    balance: 6000,
    status: "Active",
  },
  {
    id: "S-2005",
    name: "Myra Khanna",
    parentName: "Pooja Khanna",
    phone: "+91 98xxxxxx38",
    teacher: "Placeholder · Teacher Five",
    instrument: "Violin",
    packageName: "C · The Director's Circle",
    classesPurchased: 8,
    classesDone: 1,
    joiningDate: "2026-06-18",
    renewalDate: "2026-07-18",
    feePaid: 10000,
    balance: 10000,
    status: "Active",
  },
  {
    id: "S-2006",
    name: "Dev Malhotra",
    parentName: "Sunita Malhotra",
    phone: "+91 98xxxxxx71",
    teacher: "Placeholder · Teacher One",
    instrument: "Guitar",
    packageName: "A · The Foundation",
    classesPurchased: 8,
    classesDone: 8,
    joiningDate: "2026-05-02",
    renewalDate: "2026-06-02",
    feePaid: 9600,
    balance: 0,
    status: "Paused",
  },
];

// ---- Teachers (admin view) --------------------------------------------------
export const MOCK_TEACHERS: Teacher[] = [
  {
    id: "T-001",
    name: "Placeholder · Teacher One",
    instruments: ["Guitar", "Ukulele"],
    areas: ["South Delhi", "Gurugram"],
    maxStudents: 20,
    currentStudents: 14,
    rating: 4.9,
    active: true,
    verificationStatus: "Verified",
  },
  {
    id: "T-002",
    name: "Placeholder · Teacher Two",
    instruments: ["Piano", "Keyboard"],
    areas: ["Noida", "Online"],
    maxStudents: 18,
    currentStudents: 11,
    rating: 4.8,
    active: true,
    verificationStatus: "Verified",
  },
  {
    id: "T-003",
    name: "Placeholder · Teacher Three",
    instruments: ["Vocals (Western)", "Vocals (Hindustani)"],
    areas: ["Central Delhi", "Online"],
    maxStudents: 16,
    currentStudents: 9,
    rating: 4.9,
    active: true,
    verificationStatus: "Verified",
  },
  {
    id: "T-004",
    name: "Placeholder · Teacher Four",
    instruments: ["Drums", "Cajon"],
    areas: ["Gurugram", "Faridabad"],
    maxStudents: 14,
    currentStudents: 8,
    rating: 4.7,
    active: true,
    verificationStatus: "In Review",
  },
  {
    id: "T-005",
    name: "Placeholder · Teacher Five",
    instruments: ["Violin"],
    areas: ["South Delhi", "Online"],
    maxStudents: 12,
    currentStudents: 6,
    rating: 4.8,
    active: true,
    verificationStatus: "Verified",
  },
  {
    id: "T-006",
    name: "Placeholder · Teacher Six",
    instruments: ["Keyboard", "Music Theory"],
    areas: ["Faridabad"],
    maxStudents: 12,
    currentStudents: 0,
    rating: 0,
    active: false,
    verificationStatus: "Pending",
  },
];

// ---- Payments ---------------------------------------------------------------
export const MOCK_PAYMENTS: Payment[] = [
  {
    id: "PAY-3001",
    date: "2026-06-10",
    student: "Aarav Gupta",
    amount: 12000,
    packageName: "B · The Transformation",
    mode: "UPI",
    status: "Paid",
    invoice: "#", // TODO(integration): link to generated invoice PDF
  },
  {
    id: "PAY-3002",
    date: "2026-06-05",
    student: "Rohit Bansal",
    amount: 20000,
    packageName: "C · The Director's Circle",
    mode: "Bank Transfer",
    status: "Paid",
    invoice: "#",
  },
  {
    id: "PAY-3003",
    date: "2026-05-20",
    student: "Ishita Rao",
    amount: 9600,
    packageName: "A · The Foundation",
    mode: "UPI",
    status: "Paid",
    invoice: "#",
  },
  {
    id: "PAY-3004",
    date: "2026-06-01",
    student: "Vivaan Sethi",
    amount: 6000,
    packageName: "B · The Transformation",
    mode: "Cash",
    status: "Partial",
    invoice: "#",
  },
  {
    id: "PAY-3005",
    date: "2026-06-18",
    student: "Myra Khanna",
    amount: 10000,
    packageName: "C · The Director's Circle",
    mode: "UPI",
    status: "Partial",
    invoice: "#",
  },
  {
    id: "PAY-3006",
    date: "2026-05-02",
    student: "Dev Malhotra",
    amount: 9600,
    packageName: "A · The Foundation",
    mode: "Card",
    status: "Overdue",
    invoice: "#",
  },
];

// ---- Class log --------------------------------------------------------------
export const MOCK_CLASS_LOG: ClassLog[] = [
  {
    id: "C-4001",
    date: "2026-06-25",
    student: "Aarav Gupta",
    teacher: "Placeholder · Teacher Three",
    instrument: "Vocals (Western)",
    classNumber: 3,
    duration: 45,
    status: "Scheduled",
    remarks: "",
  },
  {
    id: "C-4002",
    date: "2026-06-24",
    student: "Rohit Bansal",
    teacher: "Placeholder · Teacher One",
    instrument: "Guitar",
    classNumber: 3,
    duration: 60,
    status: "Completed",
    remarks: "Worked on barre chords and timing.",
  },
  {
    id: "C-4003",
    date: "2026-06-24",
    student: "Vivaan Sethi",
    teacher: "Placeholder · Teacher Four",
    instrument: "Drums",
    classNumber: 4,
    duration: 45,
    status: "Completed",
    remarks: "Rudiments improving. Assigned practice.",
  },
  {
    id: "C-4004",
    date: "2026-06-23",
    student: "Ishita Rao",
    teacher: "Placeholder · Teacher Two",
    instrument: "Piano",
    classNumber: 7,
    duration: 45,
    status: "Completed",
    remarks: "Ready for renewal conversation.",
  },
  {
    id: "C-4005",
    date: "2026-06-23",
    student: "Myra Khanna",
    teacher: "Placeholder · Teacher Five",
    instrument: "Violin",
    classNumber: 1,
    duration: 45,
    status: "Completed",
    remarks: "First class. Posture and bow hold.",
  },
  {
    id: "C-4006",
    date: "2026-06-22",
    student: "Dev Malhotra",
    teacher: "Placeholder · Teacher One",
    instrument: "Guitar",
    classNumber: 8,
    duration: 45,
    status: "Cancelled",
    remarks: "Family travel. Paused for now.",
  },
  {
    id: "C-4007",
    date: "2026-06-26",
    student: "Aarav Gupta",
    teacher: "Placeholder · Teacher Three",
    instrument: "Vocals (Western)",
    classNumber: 4,
    duration: 45,
    status: "Scheduled",
    remarks: "",
  },
];

// ---- Derived dashboard metrics ---------------------------------------------
export function getOverviewMetrics() {
  const today = "2026-06-25";

  const newEnquiriesToday = MOCK_PEOPLE.filter((p) =>
    p.createdAt.startsWith(today)
  ).length;

  const qualifiedLeads = MOCK_PEOPLE.filter((p) =>
    ["Qualified", "Recommended"].includes(p.currentStatus)
  ).length;

  const activeStudents = MOCK_STUDENTS.filter(
    (s) => s.status === "Active" || s.status === "Renewal Due"
  ).length;

  const revenueThisMonth = MOCK_PAYMENTS.filter(
    (p) => p.date.startsWith("2026-06") && p.status === "Paid"
  ).reduce((sum, p) => sum + p.amount, 0);

  const pendingPayments = MOCK_STUDENTS.reduce((sum, s) => sum + s.balance, 0);

  const classesRemaining = MOCK_STUDENTS.reduce(
    (sum, s) => sum + (s.classesPurchased - s.classesDone),
    0
  );

  // Top lead source
  const sourceCounts = new Map<string, number>();
  MOCK_PEOPLE.forEach((p) =>
    sourceCounts.set(p.leadSource, (sourceCounts.get(p.leadSource) ?? 0) + 1)
  );
  const topLeadSource =
    [...sourceCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  // Most requested instrument
  const instrumentCounts = new Map<string, number>();
  MOCK_PEOPLE.forEach((p) =>
    instrumentCounts.set(
      p.instrument,
      (instrumentCounts.get(p.instrument) ?? 0) + 1
    )
  );
  const mostRequestedInstrument =
    [...instrumentCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "-";

  return {
    newEnquiriesToday,
    qualifiedLeads,
    activeStudents,
    revenueThisMonth,
    pendingPayments,
    classesRemaining,
    topLeadSource,
    mostRequestedInstrument,
  };
}

// ---- Marketing attribution --------------------------------------------------
export function getLeadsBySource(): { source: string; count: number }[] {
  const counts = new Map<string, number>();
  LEAD_SOURCES.forEach((s) => counts.set(s, 0));
  MOCK_PEOPLE.forEach((p) =>
    counts.set(p.leadSource, (counts.get(p.leadSource) ?? 0) + 1)
  );
  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}
