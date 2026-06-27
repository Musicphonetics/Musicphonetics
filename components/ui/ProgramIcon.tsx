import type { IconKey } from "@/lib/programs";

/** Music program / instrument line icons. */
export function ProgramIcon({ icon, size = 26 }: { icon: IconKey; size?: number }) {
  const common = {
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
    case "guitar":
      return (<svg {...common}><path d="M15 3l3 3-2 2 1 1-6 6a3 3 0 1 1-2-2l6-6 1 1 2-2-3-3z" /><circle cx="9" cy="15" r="1" /></svg>);
    case "piano":
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="1.5" /><path d="M8 5v8M12 5v8M16 5v8M3 13h18" /></svg>);
    case "vocals":
      return (<svg {...common}><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M6 11a6 6 0 0 0 12 0M12 17v4M9 21h6" /></svg>);
    case "ukulele":
      return (<svg {...common}><circle cx="9" cy="15" r="4.5" /><path d="M12.5 11.5L19 5M17 3l3 3M9 11v8" /></svg>);
    case "theory":
      return (<svg {...common}><path d="M9 18V5l11-2v12" /><circle cx="6" cy="18" r="3" /><circle cx="17" cy="15" r="3" /></svg>);
    case "grade":
      return (<svg {...common}><path d="M12 3l2.5 5 5.5.8-4 3.9.9 5.5L12 16.5 7.1 18l.9-5.5-4-3.9 5.5-.8z" /></svg>);
    case "performance":
      return (<svg {...common}><path d="M4 19c2-6 4-8 8-8s6 2 8 8" /><circle cx="12" cy="6" r="2.5" /></svg>);
    case "adult":
      return (<svg {...common}><circle cx="12" cy="7" r="3.5" /><path d="M5 21c0-4 3-6 7-6s7 2 7 6" /></svg>);
    case "kids":
      return (<svg {...common}><circle cx="12" cy="8" r="4" /><path d="M6 21c0-3 2.5-5 6-5s6 2 6 5M9 8h.01M15 8h.01M10 11a3 3 0 0 0 4 0" /></svg>);
  }
}
