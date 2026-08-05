import type { Tab } from "./PortalShell";

const I = (d: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TEACHER_TABS: Tab[] = [
  { href: "/teacher/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/teacher/leads", label: "Leads", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 8v6M22 11h-6") },
  { href: "/teacher/students", label: "Students", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z") },
  { href: "/teacher/calendar", label: "Calendar", icon: I("M3.5 5h17v15h-17zM3.5 9.5h17M8 3v4M16 3v4") },
  { href: "/teacher/class-update", label: "Class", icon: I("M4 6h16M4 12h16M4 18h10") },
  { href: "/teacher/profile", label: "Profile", icon: I("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0") },
];

export const PARENT_TABS: Tab[] = [
  { href: "/parent/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/parent/classes", label: "Classes", icon: I("M4 6h16M4 12h16M4 18h10") },
  { href: "/parent/progress", label: "Journey", icon: I("M4 19V5M4 19h16M8 16l3-4 3 2 4-6") },
  { href: "/parent/ask", label: "Ask", icon: I("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2ZM9 9h6M9 12h4") },
  { href: "/parent/reports", label: "Reports", icon: I("M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5M9 13h6M9 17h4") },
  { href: "/parent/payments", label: "Fees", icon: I("M3 7h18v10H3zM3 10h18M7 14h3") },
];

export const OWNER_TABS: Tab[] = [
  { href: "/owner/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/owner/leads", label: "Leads", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 8v6M22 11h-6") },
  { href: "/owner/applications", label: "Apply", icon: I("M9 12h6M9 16h4M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5") },
  { href: "/owner/teacher-profiles", label: "Profiles", icon: I("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0M17 3l1.5 1.5L21 3") },
  { href: "/owner/messages", label: "Messages", icon: I("M4 5h16v11H8l-4 4V5Z") },
  { href: "/owner/teachers", label: "Teachers", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z") },
  { href: "/owner/students", label: "Students", icon: I("M4 19V5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z") },
  { href: "/owner/teaching", label: "Teaching", icon: I("M12 4L2 8l10 4 10-4-10-4ZM6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4M22 8v5") },
  { href: "/owner/schedule", label: "Schedule", icon: I("M3.5 5h17v15h-17zM3.5 9.5h17M8 3v4M16 3v4") },
  { href: "/owner/payments", label: "Payments", icon: I("M3 7h18v10H3zM3 10h18M7 14h3") },
  { href: "/owner/reports", label: "Reports", icon: I("M4 4h16v16H4zM8 4v16M4 9h4M4 14h4") },
  { href: "/owner/statistics", label: "Stats", icon: I("M4 19V5M4 19h16M9 16V9M14 16v-4M19 16V7") },
  { href: "/owner/payouts", label: "Payouts", icon: I("M12 3v18M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6") },
  { href: "/owner/documents", label: "Documents", icon: I("M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5") },
  { href: "/owner/audit", label: "Audit", icon: I("M4 5h16M4 12h16M4 19h10M18 16l2 2 3-3") },
  { href: "/owner/settings", label: "Settings", icon: I("M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5L5 11a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h5l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1Z") },
];

// Sales / marketing workspace — leads only, no financials/HR/settings.
export const SALES_TABS: Tab[] = [
  { href: "/sales/dashboard", label: "Dashboard", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/sales/leads", label: "Leads", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM19 8v6M22 11h-6") },
];
