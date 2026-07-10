import Link from "next/link";

// The Parent / Student login given real presence - a dark forest-green card with
// a glowing icon and a gold action, exactly the weight the reference gives it.
// (Owner login stays private - this is the family-facing portal only.)
export function NightPortalCard() {
  return (
    <Link
      href="/parent/login"
      className="group relative flex items-center gap-4 overflow-hidden rounded-3xl border border-emerald-400/20 bg-gradient-to-br from-forest via-[#0F241B] to-onyx-1 p-4 transition-all hover:border-emerald-400/40 sm:gap-5 sm:p-5"
    >
      {/* soft green glow */}
      <span aria-hidden="true" className="pointer-events-none absolute -left-10 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-emerald-400/10 blur-2xl" />

      <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full border border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300 shadow-[0_0_30px_-6px_rgba(52,211,153,0.5)] sm:h-[72px] sm:w-[72px]">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.7" /><path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" /><circle cx="16.5" cy="9" r="2.4" stroke="currentColor" strokeWidth="1.6" /><path d="M15 19a4.5 4.5 0 0 1 6-4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </span>

      <div className="relative min-w-0 flex-1">
        <h2 className="font-display text-xl font-medium leading-tight text-paper sm:text-2xl">
          Parent / Student Login
        </h2>
        <p className="mt-1.5 text-[0.9rem] leading-snug text-paper/65 sm:text-base">
          Track classes, homework, progress &amp; monthly reports
        </p>
      </div>

      <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold text-ink transition-transform group-hover:translate-x-0.5 sm:h-12 sm:w-12">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </Link>
  );
}
