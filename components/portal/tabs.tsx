import type { Tab } from "./PortalShell";

const I = (d: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const TEACHER_TABS: Tab[] = [
  { href: "/teacher/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/teacher/students", label: "Students", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z") },
  { href: "/teacher/class-update", label: "Class", icon: I("M4 6h16M4 12h16M4 18h10") },
  { href: "/teacher/payments", label: "Payments", icon: I("M3 7h18v10H3zM3 10h18M7 14h3") },
  { href: "/teacher/profile", label: "Profile", icon: I("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0") },
];

export const PARENT_TABS: Tab[] = [
  { href: "/parent/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/parent/classes", label: "Classes", icon: I("M4 6h16M4 12h16M4 18h10") },
  { href: "/parent/progress", label: "Journey", icon: I("M4 19V5M4 19h16M8 16l3-4 3 2 4-6") },
  { href: "/parent/reports", label: "Reports", icon: I("M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5M9 13h6M9 17h4") },
  { href: "/parent/payments", label: "Fees", icon: I("M3 7h18v10H3zM3 10h18M7 14h3") },
];

export const OWNER_TABS: Tab[] = [
  { href: "/owner/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/owner/applications", label: "Apply", icon: I("M9 12h6M9 16h4M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5") },
  { href: "/owner/messages", label: "Messages", icon: I("M4 5h16v11H8l-4 4V5Z") },
  { href: "/owner/teachers", label: "Teachers", icon: I("M16 19v-1a4 4 0 0 0-8 0v1M12 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z") },
  { href: "/owner/students", label: "Students", icon: I("M4 19V5a1 1 0 0 1 1-1h11l4 4v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z") },
  { href: "/owner/payments", label: "Payments", icon: I("M3 7h18v10H3zM3 10h18M7 14h3") },
  { href: "/owner/reports", label: "Reports", icon: I("M4 4h16v16H4zM8 4v16M4 9h4M4 14h4") },
  { href: "/owner/payouts", label: "Payouts", icon: I("M12 3v18M17 7H9.5a2.5 2.5 0 0 0 0 5h5a2.5 2.5 0 0 1 0 5H6") },
];
