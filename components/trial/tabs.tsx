import type { Tab } from "@/components/portal/PortalShell";

const I = (d: string) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d={d} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// The Trial Portal's own bottom-tab set (mirrors the reference design).
export const TRIAL_TABS: Tab[] = [
  { href: "/trial/dashboard", label: "Home", icon: I("M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9") },
  { href: "/trial/journey", label: "Journey", icon: I("M4 19V5M4 19h16M8 16l3-4 3 2 4-6") },
  { href: "/trial/ask", label: "Ask", icon: I("M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2ZM9 9h6M9 12h4") },
  { href: "/trial/updates", label: "Updates", icon: I("M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0") },
  { href: "/trial/profile", label: "Profile", icon: I("M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0") },
];
