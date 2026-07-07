import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { HOME_PACKAGES, WA_MSG, type HomePackage } from "@/lib/home-config";
import { cn } from "@/lib/utils";

// Map a card key to its detail-page slug.
const SLUG: Record<string, string> = { foundation: "foundation", main: "main", directors: "directors-circle" };

export function FunnelPackages() {
  return (
    <section id="programmes" className="bg-ink py-20 text-paper sm:py-24">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-gold">Programmes &amp; Fees</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Choose the path that fits the student.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/75">
            Not sure which fits? Open <span className="font-semibold text-paper">View details</span> — a full page explains exactly who each plan is for, what you learn and what to expect.
          </p>
        </Reveal>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-3">
          {HOME_PACKAGES.map((p, i) => (
            <Reveal key={p.key} delay={(i % 3) * 80}>
              <PackageCard p={p} />
            </Reveal>
          ))}
        </div>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-paper/60">
            Every plan starts with a quick chat so we match the right teacher and confirm the fit.
          </p>
          <div className="mt-4 flex justify-center">
            <WhatsAppCTA label="Not sure? Ask us on WhatsApp" message={WA_MSG.packages} variant="outline" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function PackageCard({ p }: { p: HomePackage }) {
  const featured = p.featured;
  const exclusive = p.exclusive;
  const slug = SLUG[p.key] ?? p.key;
  return (
    <div
      className={cn(
        "relative flex h-full flex-col rounded-3xl border p-7 transition-all",
        featured
          ? "border-gold/70 bg-gradient-to-b from-gold/[0.10] to-white/[0.02] shadow-[0_0_50px_-12px_rgba(201,162,39,0.45)] lg:-translate-y-3 lg:p-8"
          : exclusive
            ? "border-white/12 bg-[#11151f]"
            : "border-white/10 bg-white/[0.03]"
      )}
    >
      {(p.badge || p.secondaryBadge) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {p.badge && (
            <span className={cn("rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide",
              featured ? "bg-gold text-ink" : "border border-white/20 text-paper/80")}>{p.badge}</span>
          )}
          {p.secondaryBadge && (
            <span className="rounded-full border border-gold/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-gold">{p.secondaryBadge}</span>
          )}
        </div>
      )}

      <h3 className={cn("font-display font-semibold leading-tight text-paper", featured ? "text-2xl" : "text-xl")}>{p.name}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-paper/70">{p.tagline}</p>

      <div className="mt-5">
        {p.price ? (
          <p className="flex items-baseline gap-1.5">
            <span className={cn("font-display font-semibold", featured ? "text-4xl text-gold" : "text-3xl text-paper")}>{p.price}</span>
            <span className="text-sm text-paper/60">/ month</span>
          </p>
        ) : (
          <p className="font-display text-2xl font-semibold text-gold">By Request</p>
        )}
        {p.cadence && <p className="mt-1 text-sm text-paper/60">{p.cadence}</p>}
      </div>

      <ul className="mt-6 space-y-2.5">
        {p.bullets.map((b) => (
          <li key={b} className="flex items-start gap-2.5 text-sm text-paper/80">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn("mt-0.5 shrink-0", featured ? "text-gold" : "text-paper/45")}>
              <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {b}
          </li>
        ))}
      </ul>

      {p.note && <p className="mt-5 rounded-xl bg-white/[0.04] px-3 py-2 text-xs leading-relaxed text-paper/65">{p.note}</p>}

      <div className="mt-7 flex flex-col gap-2.5 pt-1">
        {p.payAmount ? (
          <Link href={`/pay?plan=${p.key}&amt=${p.payAmount}`}
            className={cn("inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all active:scale-[0.98]",
              featured ? "bg-gold text-ink shadow-card hover:bg-deep-gold" : "border border-gold/50 text-gold hover:bg-gold/10")}>
            Enrol Now · Pay Securely
          </Link>
        ) : (
          <WhatsAppCTA label={p.ctaLabel} message={p.ctaMsg} size="md" fullWidth variant="primary" />
        )}

        <Link href={`/programmes/${slug}`}
          className="inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-full border border-white/15 text-sm font-semibold text-paper/85 transition-colors hover:border-white/40 hover:text-paper">
          View details →
        </Link>
      </div>
    </div>
  );
}
