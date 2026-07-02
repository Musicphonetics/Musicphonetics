import Link from "next/link";
import { InstrumentIcon, type InstrumentKey } from "@/components/ui/InstrumentIcon";

/**
 * Hero instrument picker — premium cards.
 * Each card navigates straight to onboarding, deep-linked to the instrument
 * (no input, no dropdown). "More" opens the full instrument step.
 * (Photos can be layered in later when student/instrument imagery is added.)
 */
const CARDS: { label: string; value?: string; icon?: InstrumentKey; note: string }[] = [
  { label: "Guitar", value: "Guitar", icon: "guitar", note: "Strum. Play. Express." },
  { label: "Piano", value: "Piano", icon: "piano", note: "Classical to contemporary." },
  { label: "Vocals", value: "Vocals", icon: "vocals", note: "Find your voice." },
  { label: "Keyboard", value: "Keyboard", icon: "keyboard", note: "Melodies & more." },
  { label: "Ukulele", value: "Ukulele", icon: "ukulele", note: "Fun, easy & joyful." },
  { label: "More", value: undefined, note: "Explore all instruments." },
];

export function InstrumentChips() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CARDS.map((c) => {
        const href = c.value
          ? `/start?instrument=${encodeURIComponent(c.value)}`
          : "/start";
        return (
          <Link
            key={c.label}
            href={href}
            className="group flex min-h-[76px] flex-col justify-between rounded-2xl border border-white/12 bg-white/[0.05] p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-white/[0.09] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
          >
            <span className="flex items-center justify-between text-gold">
              {c.icon ? (
                <InstrumentIcon name={c.icon} size={22} />
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-paper/30 transition-colors group-hover:text-gold">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="mt-2">
              <span className="block text-sm font-semibold text-paper">{c.label}</span>
              <span className="block text-[11px] leading-tight text-paper/55">{c.note}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
