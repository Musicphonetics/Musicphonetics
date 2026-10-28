// Navigation configuration for the new /app/* authenticated application.
// Phase 1: existing roles only (teacher, parent). Owner/Admin, Sales and Trial
// keep their existing portals; the /app shell links out to them, it does not
// replace them.

export type AppRole = "teacher" | "parent";

export type NavItem = { label: string; href: string; icon: string };

export const NAV: Record<AppRole, NavItem[]> = {
  teacher: [
    { label: "Home", href: "/app/teacher/home", icon: "home" },
    { label: "Students", href: "/app/teacher/students", icon: "users" },
    { label: "Lessons", href: "/app/teacher/lessons", icon: "book" },
    { label: "Calendar", href: "/app/teacher/calendar", icon: "calendar" },
    { label: "Enquiries", href: "/app/teacher/enquiries", icon: "inbox" },
    { label: "Profile", href: "/app/teacher/profile", icon: "user" },
  ],
  parent: [
    { label: "Home", href: "/app/parent/home", icon: "home" },
    { label: "Children", href: "/app/parent/children", icon: "children" },
    { label: "Updates", href: "/app/parent/updates", icon: "bell" },
    { label: "Teachers", href: "/app/parent/teachers", icon: "search" },
    { label: "Profile", href: "/app/parent/profile", icon: "user" },
  ],
};

// Where each role's real, working features live today (the classic portals).
export const CLASSIC: Record<AppRole, { portal: string; login: string; label: string }> = {
  teacher: { portal: "/teacher/dashboard", login: "/teacher/login", label: "Teacher portal" },
  parent: { portal: "/parent/dashboard", login: "/parent/login", label: "Student portal" },
};

export const ROLE_LABEL: Record<AppRole, string> = { teacher: "Teacher", parent: "Parent" };
