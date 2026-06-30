import Link from "next/link";
import { InstrumentIcon, type InstrumentKey } from "@/components/ui/InstrumentIcon";

/**
 * Hero instrument picker — tappable chips.
 * Each chip navigates straight to the onboarding, deep-linked to the chosen
 * instrument (no input, no dropdown, no second click). "More" opens the full
 * instrument step.
 */
const CHIPS: { label: string; value?: string; icon?: InstrumentKey }[] = [
  { label: "Guitar", value: "Guitar", icon: "guitar" },
  { label: "Piano", value: "Piano", icon: "piano" },
  { label: "Vocals", value: "Vocals", icon: "vocals" },
  { label: "Keyboard", value: "Keyboard", icon: "keyboard" },
  { label: "Ukulele", value: "Ukulele", icon: "ukulele" },
  { label: "More", value: undefined },
];

export function InstrumentChips() {
  return (
    <div className="flex flex-wrap gap-2.5">
      {CHIPS.map((c) => {
        const href = c.value
          ? `/start?instrument=${encodeURIComponent(c.value)}`
          : "/start";
        return (
          <Link
            key={c.label}
            href={href}
            className="group inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 text-sm font-semibold text-paper/90 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/[0.1] hover:text-paper focus-visible:outline-2 focus-visible:outline-gold"
          >
            <span className="text-gold">
              {c.icon ? (
                <InstrumentIcon name={c.icon} size={18} />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </span>
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
