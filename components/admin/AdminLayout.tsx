"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/Logo";
import { signOutAdmin } from "@/lib/admin-auth";
import { cn } from "@/lib/utils";

export type AdminTab =
  | "overview"
  | "people"
  | "students"
  | "teachers"
  | "classes"
  | "payments"
  | "marketing"
  | "automation"
  | "settings";

export const ADMIN_TABS: { key: AdminTab; label: string; icon: ReactNode }[] = [
  { key: "overview", label: "Overview", icon: <IconGrid /> },
  { key: "people", label: "People", icon: <IconUsers /> },
  { key: "students", label: "Students", icon: <IconCap /> },
  { key: "teachers", label: "Teachers", icon: <IconStar /> },
  { key: "classes", label: "Classes", icon: <IconCalendar /> },
  { key: "payments", label: "Payments", icon: <IconRupee /> },
  { key: "marketing", label: "Marketing", icon: <IconChart /> },
  { key: "automation", label: "Automation Map", icon: <IconBot /> },
  { key: "settings", label: "Settings", icon: <IconGear /> },
];

interface AdminLayoutProps {
  active: AdminTab;
  onChange: (tab: AdminTab) => void;
  children: ReactNode;
}

export function AdminLayout({ active, onChange, children }: AdminLayoutProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeLabel =
    ADMIN_TABS.find((t) => t.key === active)?.label ?? "Overview";

  function handleSignOut() {
    signOutAdmin();
    router.push("/admin/login");
  }

  const NavItems = (
    <nav className="flex flex-col gap-1">
      {ADMIN_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => {
            onChange(tab.key);
            setMobileOpen(false);
          }}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
            active === tab.key
              ? "bg-white/10 text-paper"
              : "text-paper/60 hover:bg-white/5 hover:text-paper"
          )}
          aria-current={active === tab.key ? "page" : undefined}
        >
          <span className="text-gold">{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col justify-between bg-ink p-5 lg:flex">
        <div>
          <Logo invert />
          <p className="mt-1 pl-10 text-xs text-paper/40">Owner portal</p>
          <div className="mt-8">{NavItems}</div>
        </div>
        <button
          type="button"
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-paper/60 hover:bg-white/5 hover:text-paper"
        >
          <IconLogout />
          Sign out
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 flex h-full w-72 flex-col justify-between bg-ink p-5">
            <div>
              <Logo invert />
              <div className="mt-8">{NavItems}</div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-paper/60 hover:bg-white/5 hover:text-paper"
            >
              <IconLogout />
              Sign out
            </button>
          </aside>
        </div>
      )}

      {/* Content */}
      <div className="flex min-w-0 flex-1 flex-col bg-mist">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-hairline bg-paper/90 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-hairline lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-ink">{activeLabel}</h1>
          </div>
          <span className="hidden text-sm text-ink/50 sm:block">
            Demo data · v1
          </span>
        </header>

        <main className="flex-1 p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

/* ---- Inline icons (no dependency) ---------------------------------------- */
function IconBase({ children }: { children: ReactNode }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {children}
    </svg>
  );
}
function IconGrid() {
  return <IconBase><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.6" /></IconBase>;
}
function IconUsers() {
  return <IconBase><circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M17 7a3 3 0 0 1 0 6M21 20c0-2-1-3.5-3-4.3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></IconBase>;
}
function IconCap() {
  return <IconBase><path d="M3 9l9-4 9 4-9 4-9-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M7 11v4c0 1.1 2.2 2 5 2s5-.9 5-2v-4" stroke="currentColor" strokeWidth="1.6" /></IconBase>;
}
function IconStar() {
  return <IconBase><path d="M12 4l2.3 4.7 5.2.8-3.7 3.6.9 5.1L12 15.8 7.3 18.2l.9-5.1L4.5 9.5l5.2-.8L12 4Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></IconBase>;
}
function IconCalendar() {
  return <IconBase><rect x="3" y="5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M3 9h18M8 3v4M16 3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></IconBase>;
}
function IconRupee() {
  return <IconBase><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" /><path d="M9 8h6M9 11h6M14 8c0 3-2 4-4 4l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
function IconChart() {
  return <IconBase><path d="M4 20V4M4 20h16M8 16v-4M12 16V8M16 16v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></IconBase>;
}
function IconBot() {
  return <IconBase><rect x="4" y="8" width="16" height="11" rx="3" stroke="currentColor" strokeWidth="1.6" /><path d="M12 4v4M9 13h.01M15 13h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></IconBase>;
}
function IconGear() {
  return <IconBase><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.6" /><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></IconBase>;
}
function IconLogout() {
  return <IconBase><path d="M15 12H4M11 8l-4 4 4 4M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></IconBase>;
}
