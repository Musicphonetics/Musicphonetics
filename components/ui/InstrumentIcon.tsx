export type InstrumentKey =
  | "guitar" | "piano" | "keyboard" | "vocals" | "drums" | "violin" | "ukulele"
  | "bass" | "production" | "theory";

/** Premium monochrome line icons for instruments (hero + onboarding). */
export function InstrumentIcon({ name, size = 30 }: { name: InstrumentKey; size?: number }) {
  const p = {
    width: size, height: size, viewBox: "0 0 24 24", fill: "none",
    "aria-hidden": true, stroke: "currentColor", strokeWidth: 1.5,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
  };
  switch (name) {
    case "guitar":
      return <svg {...p}><path d="M15 3l3 3-2 2 1 1-6 6a3 3 0 1 1-2-2l6-6 1 1 2-2-3-3z" /><circle cx="9" cy="15" r="1" /></svg>;
    case "piano":
      return <svg {...p}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M8 5v8M12 5v8M16 5v8M3 13h18" /></svg>;
    case "keyboard":
      return <svg {...p}><rect x="2" y="7" width="20" height="10" rx="1.5" /><path d="M7 7v6M12 7v6M17 7v6M2 13h20" /></svg>;
    case "vocals":
      return <svg {...p}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></svg>;
    case "drums":
      return <svg {...p}><path d="M3 9c0-1.7 4-3 9-3s9 1.3 9 3-4 3-9 3-9-1.3-9-3z" /><path d="M3 9v6c0 1.7 4 3 9 3s9-1.3 9-3V9" /><path d="M7 12l-3 7M17 12l3 7" /></svg>;
    case "violin":
      return <svg {...p}><path d="M14 3l4 4-2 2 1 1-2 2a3.5 3.5 0 1 1-2-2l2-2-1-1 2-2z" /><path d="M9 12l3 3" /><circle cx="8" cy="16" r="3.2" /></svg>;
    case "ukulele":
      return <svg {...p}><circle cx="9" cy="15" r="4.5" /><path d="M12.5 11.5L19 5M17 3l3 3M9 11v8" /></svg>;
    case "bass":
      return <svg {...p}><path d="M16 3l4 4-2 2-7 7a3 3 0 1 1-2-2l7-7-2-2 2-2z" /><circle cx="9" cy="16" r="0.8" /></svg>;
    case "production":
      return <svg {...p}><path d="M6 4v16M12 4v16M18 4v16" /><circle cx="6" cy="9" r="1.6" /><circle cx="12" cy="14" r="1.6" /><circle cx="18" cy="8" r="1.6" /></svg>;
    case "theory":
      return <svg {...p}><path d="M9 18V5l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="15" r="3" /></svg>;
  }
}
