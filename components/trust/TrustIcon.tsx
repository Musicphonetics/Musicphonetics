import type { TrustIconKey } from "@/lib/trust";

/** Custom monochrome line icons for the Trust Centre (no generic icon set). */
export function TrustIcon({ icon, size = 22 }: { icon: TrustIconKey; size?: number }) {
  const p = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    "aria-hidden": true,
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (icon) {
    case "finance": return <svg {...p}><path d="M4 19V5M4 19h16M8 16v-4M12 16V9M16 16v-6" /></svg>;
    case "accounts": return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 7h8M8 11h8M8 15h5" /></svg>;
    case "tax": return <svg {...p}><path d="M7 3h10l3 4-8 14L4 7z" /><path d="M9 10h6" /></svg>;
    case "student": return <svg {...p}><path d="M3 9l9-4 9 4-9 4-9-4z" /><path d="M7 11v4c0 1 2.2 2 5 2s5-1 5-2v-4" /></svg>;
    case "teacher": return <svg {...p}><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3 2.7-5 6-5s6 2 6 5M17 7a3 3 0 0 1 0 6" /></svg>;
    case "quality": return <svg {...p}><path d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.9 7.2 18l.9-5.4L4.2 8.7l5.4-.8z" /></svg>;
    case "reports": return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 13l2 2 4-5" /></svg>;
    case "compliance": return <svg {...p}><path d="M12 3l7 3v5c0 5-3 7-7 9-4-2-7-4-7-9V6z" /><path d="M9 12l2 2 4-4" /></svg>;
    case "support": return <svg {...p}><circle cx="12" cy="12" r="8" /><path d="M8 18v1a2 2 0 0 0 2 2h1M5 12a7 7 0 0 1 14 0M5 12v2M19 12v2" /></svg>;
    case "tech": return <svg {...p}><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 20h8M12 16v4" /></svg>;
    case "standards": return <svg {...p}><path d="M6 3h9l3 3v15H6z" /><path d="M14 3v4h4M9 13h6M9 16h4" /></svg>;
    case "handbook": return <svg {...p}><path d="M5 4h11a2 2 0 0 1 2 2v14H7a2 2 0 0 1-2-2z" /><path d="M5 17h13" /></svg>;
    case "assessment": return <svg {...p}><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></svg>;
    case "attendance": return <svg {...p}><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 9h18M8 3v4M16 3v4M9 14l2 2 4-4" /></svg>;
    case "safety": return <svg {...p}><path d="M12 3l7 3v5c0 5-3 7-7 9-4-2-7-4-7-9V6z" /><circle cx="12" cy="11" r="2" /><path d="M12 13v3" /></svg>;
    case "refund": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M15 9a3 3 0 0 0-3-2c-1.7 0-3 1-3 2.2 0 2.8 6 1.8 6 4.6C15 17 13.7 18 12 18a3 3 0 0 1-3-2M12 5v2M12 17v2" /></svg>;
    case "privacy": return <svg {...p}><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></svg>;
    case "terms": return <svg {...p}><path d="M7 3h7l4 4v14H7z" /><path d="M13 3v4h4M10 13h5M10 16h5" /></svg>;
    case "verify": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M8 12l3 3 5-6" /></svg>;
    case "sop": return <svg {...p}><path d="M6 3h12v18l-6-3-6 3z" /><path d="M9 8h6M9 11h6" /></svg>;
    case "certificate": return <svg {...p}><rect x="4" y="4" width="16" height="12" rx="2" /><circle cx="12" cy="10" r="2.4" /><path d="M9 16l-1 5 4-2 4 2-1-5" /></svg>;
    case "media": return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 9h6M7 13h10M7 16h7" /></svg>;
    case "talk": return <svg {...p}><path d="M12 14v6M9 20h6" /><rect x="9" y="3" width="6" height="9" rx="3" /><path d="M6 10a6 6 0 0 0 12 0" /></svg>;
    case "performance": return <svg {...p}><path d="M9 18V6l10-2v10" /><circle cx="6" cy="18" r="3" /><circle cx="16" cy="14" r="3" /></svg>;
    case "institution": return <svg {...p}><path d="M3 10l9-5 9 5M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18" /></svg>;
    case "gov": return <svg {...p}><path d="M12 3l8 4H4z" /><path d="M6 9v8M10 9v8M14 9v8M18 9v8M4 21h16" /></svg>;
    case "network": return <svg {...p}><circle cx="12" cy="5" r="2" /><circle cx="5" cy="18" r="2" /><circle cx="19" cy="18" r="2" /><path d="M12 7l-6 9M12 7l6 9M7 18h10" /></svg>;
    case "library": return <svg {...p}><path d="M5 4h4v16H5zM10 4h4v16h-4z" /><path d="M16 5l3 1-3 14-3-1z" /></svg>;
    case "timeline": return <svg {...p}><path d="M12 4v16" /><circle cx="12" cy="7" r="2" /><circle cx="12" cy="17" r="2" /><path d="M14 7h4M6 17h4" /></svg>;
    case "dashboard": return <svg {...p}><circle cx="12" cy="13" r="8" /><path d="M12 13l4-3M4 13h2M18 13h2M12 5v2" /></svg>;
    case "globe": return <svg {...p}><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18" /></svg>;
    default: return <svg {...p}><circle cx="12" cy="12" r="8" /></svg>;
  }
}
