import Link from "next/link";
import { cn } from "@/lib/utils";

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Primary "Book a free trial" CTA, opens the Trial Portal (no WhatsApp).
export function TrialCTA({
  label = "Book a free trial", variant = "primary", size = "lg", className, fullWidth, instrument,
}: {
  label?: string; variant?: "primary" | "outline"; size?: "md" | "lg";
  className?: string; fullWidth?: boolean; instrument?: string;
}) {
  const href = instrument ? `/studio?instrument=${encodeURIComponent(instrument)}` : "/studio";
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold active:scale-[0.98] motion-reduce:active:scale-100";
  const sizes = size === "lg" ? "px-7 py-4 text-base" : "px-5 py-2.5 text-sm";
  const variants =
    variant === "primary"
      ? "bg-gold text-ink shadow-card hover:bg-deep-gold hover:-translate-y-0.5"
      : "border border-white/25 text-paper hover:border-white";
  return (
    <Link href={href} className={cn(base, sizes, variants, fullWidth && "w-full", className)}>
      {label}<ArrowIcon />
    </Link>
  );
}
