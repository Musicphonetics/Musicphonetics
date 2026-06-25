import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  invert?: boolean;
  className?: string;
}

/** Musicphonetics wordmark with a small gold seal. */
export function Logo({ invert = false, className }: LogoProps) {
  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-2.5", className)}
      aria-label="Musicphonetics home"
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 place-items-center rounded-full border border-gold/50 bg-gold/10 text-deep-gold transition-colors group-hover:bg-gold/20"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path
            d="M9 18V6l10-2v11"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="6" cy="18" r="2.4" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="16" cy="15" r="2.4" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </span>
      <span
        className={cn(
          "font-display text-lg font-semibold tracking-tight",
          invert ? "text-paper" : "text-ink"
        )}
      >
        Musicphonetics
      </span>
    </Link>
  );
}
