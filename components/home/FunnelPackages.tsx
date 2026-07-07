"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { WhatsAppCTA } from "./WhatsAppCTA";
import { HOME_PACKAGES, WA_MSG, type HomePackage } from "@/lib/home-config";
import { cn } from "@/lib/utils";

export function FunnelPackages() {
  const [detail, setDetail] = useState<HomePackage | null>(null);
  return (
    <section id="programmes" className="bg-ink py-20 text-paper sm:py-24">
      <div className="container-mp">
        <Reveal>
          <p className="eyebrow text-gold">Programmes</p>
          <h2 className="mt-3 max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
            Choose the path that fits the student.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/75">
            Not sure which fits? Tap <span className="font-semibold text-paper">View details</span> on any plan — we explain exactly who it&apos;s for.
          </p>
        </Reveal>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-3">
          {HOME_PACKAGES.map((p, i) => (
            <Reveal key={p.key} delay={(i % 3) * 80}>
              <PackageCard p={p} onDetails={() => setDetail(p)} />
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

      {detail && <DetailsModal p={detail} onClose={() => setDetail(null)} />}
    </section>
  );
}

function PackageCard({ p, onDetails }: { p: HomePackage; onDetails: () => void }) {
  const featured = p.featured;
  const exclusive = p.exclusive;
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
        {/* Primary action */}
        {p.payAmount ? (
          <Link
            href={`/pay?plan=${p.key}&amt=${p.payAmount}`}
            className={cn(
              "inline-flex min-h-[48px] w-full items-center justify-center rounded-full px-5 text-sm font-semibold transition-all active:scale-[0.98]",
              featured ? "bg-gold text-ink shadow-card hover:bg-deep-gold" : "border border-gold/50 text-gold hover:bg-gold/10"
            )}
          >
            Enrol Now · Pay Securely
          </Link>
        ) : (
          <WhatsAppCTA label={p.ctaLabel} message={p.ctaMsg} size="md" fullWidth variant="primary" />
        )}

        {/* Secondary row */}
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={onDetails}
            className="text-sm font-semibold text-paper/80 underline underline-offset-4 hover:text-paper">
            View details
          </button>
          {p.payAmount && (
            <a href={`https://wa.me/918796199188?text=${encodeURIComponent(p.ctaMsg)}`} target="_blank" rel="noopener noreferrer"
              className="text-sm font-medium text-paper/60 hover:text-paper">
              or ask on WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailsModal({ p, onClose }: { p: HomePackage; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[60] grid place-items-end bg-black/70 backdrop-blur-sm sm:place-items-center" onClick={onClose} role="dialog" aria-modal="true">
      <div
        className="max-h-[90vh] w-full overflow-y-auto rounded-t-3xl border border-white/12 bg-ink p-6 text-paper sm:max-w-lg sm:rounded-3xl sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            {p.secondaryBadge && <p className="eyebrow text-gold">{p.secondaryBadge}</p>}
            <h3 className="mt-1 font-display text-2xl font-semibold">{p.name}</h3>
            <p className="mt-1 text-sm text-paper/70">
              {p.price ? `${p.price} / month` : "By request"}{p.cadence ? ` · ${p.cadence}` : ""}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-paper hover:bg-white/20">✕</button>
        </div>

        <div className="mt-6 rounded-2xl border border-feature-green/30 bg-feature-green/[0.06] p-5">
          <p className="text-sm font-semibold text-emerald-300">Who this is for</p>
          <ul className="mt-3 space-y-2">
            {p.forWho.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-sm text-paper/85">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-emerald-400"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-sm font-semibold text-paper/70">Who this is not for</p>
          <ul className="mt-3 space-y-2">
            {p.notForWho.map((x) => (
              <li key={x} className="flex items-start gap-2.5 text-sm text-paper/60">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-paper/40"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
                {x}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-2.5">
          {p.payAmount ? (
            <Link href={`/pay?plan=${p.key}&amt=${p.payAmount}`}
              className="inline-flex min-h-[50px] w-full items-center justify-center rounded-full bg-gold px-5 text-base font-semibold text-ink shadow-card hover:bg-deep-gold">
              Enrol Now · Pay Securely
            </Link>
          ) : null}
          <WhatsAppCTA label={p.payAmount ? "Ask a question on WhatsApp" : p.ctaLabel} message={p.ctaMsg} size="md" fullWidth variant="outline" />
        </div>
      </div>
    </div>
  );
}
