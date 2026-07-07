"use client";

import { useMemo, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { Stave } from "@/components/ui/Stave";
import { ReviewVideos } from "@/components/sections/ReviewVideos";
import { REVIEWS, whatsappTrialLink } from "@/lib/data";
import type { Review } from "@/lib/types";
import { cn } from "@/lib/utils";

// --- Curated subsets -------------------------------------------------------
const CRUSHER_ORDER = ["Priya Sharma", "Major General", "Rajesh Verma"];
const CRUSHER = CRUSHER_ORDER.map((n) => REVIEWS.find((r) => r.name === n)).filter(
  Boolean
) as Review[];

const DEFENCE = REVIEWS.filter((r) => r.defence);
// All four rank labels are shown as typographic badges…
const RANKS = ["Lt Col", "Col", "Brigadier", "Major General"];

// De-dupe: every quote appears exactly once across the page.
// Crusher pulls its 3; the defence band shows the defence quotes NOT already in
// the crusher (so the Major General quote isn't repeated); the wall shows the
// remaining unique reviews.
const CRUSHER_NAMES = new Set(CRUSHER.map((r) => r.name));
const DEFENCE_QUOTES = DEFENCE.filter((r) => !CRUSHER_NAMES.has(r.name));
const FEATURED = new Set([...CRUSHER, ...DEFENCE].map((r) => r.name));
const WALL = REVIEWS.filter((r) => !FEATURED.has(r.name));

const LOCALITIES = [
  "Dwarka",
  "Vasant Kunj",
  "Green Park",
  "South Extension",
  "Delhi Cantonment",
  "Golf Course Road",
  "Gurugram",
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "parents", label: "Parents" },
  { key: "students", label: "Students" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

function matches(r: Review, f: FilterKey) {
  if (f === "parents") return r.role === "Parent";
  if (f === "students") return r.role === "Student";
  return true;
}

// --- Gold star row with draw-in -------------------------------------------
function Stars({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <div role="img" className={cn("flex gap-0.5 text-gold", className)} aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.svg
          key={i}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          initial={reduced ? false : { opacity: 0, scale: 0.3 }}
          whileInView={reduced ? undefined : { opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ delay: i * 0.06, type: "spring", stiffness: 320, damping: 18 }}
        >
          <path d="M12 2.2l2.95 6.4 6.85.7-5.1 4.6 1.45 6.9L12 17.7 5.9 21.2l1.45-6.9-5.1-4.6 6.85-.7z" />
        </motion.svg>
      ))}
    </div>
  );
}

function RoleChip({ r }: { r: Review }) {
  const isParent = r.role === "Parent";
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-2.5 py-1 text-[11px] font-semibold text-ink/70">
      <span
        aria-hidden="true"
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          isParent ? "bg-gold" : "bg-feature-green"
        )}
      />
      {isParent ? "Parent" : `Student · ${r.age}`}
    </span>
  );
}

function FeePill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#7A5E0F]">
      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      On our fees
    </span>
  );
}

function WallCard({ r }: { r: Review }) {
  return (
    <figure className="flex h-full flex-col rounded-3xl border border-hairline bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 hover:shadow-card-hover">
      <div className="flex items-center justify-between gap-3">
        <Stars />
        {r.onFees && <FeePill />}
      </div>
      <blockquote className="mt-4 flex-1 text-[0.97rem] leading-relaxed text-ink/80">
        “{r.quote}”
      </blockquote>
      <figcaption className="mt-5 flex flex-wrap items-center gap-2 border-t border-hairline pt-4">
        <span className="font-display text-base font-semibold text-ink">{r.name}</span>
        <span className="text-ink/30">·</span>
        <RoleChip r={r} />
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-mist px-2.5 py-1 text-[11px] font-medium text-ink/65">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.7" />
            <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
          </svg>
          {r.area}
        </span>
      </figcaption>
    </figure>
  );
}

export function ReviewsShowcase() {
  const [filter, setFilter] = useState<FilterKey>("all");
  const reduced = useReducedMotion();
  const visible = useMemo(() => WALL.filter((r) => matches(r, filter)), [filter]);

  return (
    <section id="reviews">
      {/* 1 · Positioning headline + trust bar */}
      <div className="bg-paper">
        <div className="container-mp py-20 sm:py-28">
          <Reveal>
            <div className="max-w-3xl">
              <p className="eyebrow">Loved by families</p>
              <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[2.85rem]">
                Trusted across Delhi NCR - by defence officers, professionals,
                and discerning parents.
              </h2>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
              <span className="inline-flex items-center gap-2 font-semibold text-ink">
                <Stars />
                5.0 across every review
              </span>
              <span className="inline-flex items-center gap-2 text-ink/65">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-feature-green">
                  <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Verified · collected after real classes
              </span>
              <span className="text-ink/65">Home &amp; online</span>
            </div>
          </Reveal>

          {/* 2 · Price-objection crusher (first) */}
          <Reveal delay={120}>
            <div className="mt-12 overflow-hidden rounded-[2rem] bg-ink p-8 text-paper sm:p-12">
              <div className="flex items-center gap-4">
                <Stave className="w-20 opacity-70" />
                <p className="eyebrow text-gold">On the question of fees</p>
              </div>
              <h3 className="mt-4 max-w-2xl font-display text-2xl font-semibold leading-tight sm:text-3xl">
                Yes, we&apos;re premium. Here&apos;s what that actually buys.
              </h3>
              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {CRUSHER.map((r, i) => (
                  <Reveal key={r.name} delay={i * 100}>
                    <figure className="flex h-full flex-col">
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gold/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-gold">
                        On our fees
                      </span>
                      <blockquote className="mt-4 flex-1 font-display text-lg leading-snug text-paper/95 sm:text-xl">
                        “{r.quote}”
                      </blockquote>
                      <figcaption className="mt-5 text-sm font-semibold text-gold">
                        {r.name}
                        <span className="ml-2 font-normal text-paper/50">{r.area}</span>
                      </figcaption>
                    </figure>
                  </Reveal>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>

      {/* 3 · Defence Families band */}
      <div className="relative overflow-hidden bg-midnight text-paper">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[820px] -translate-x-1/2 rounded-full bg-gold/[0.07] blur-[120px]"
        />
        <div className="container-mp relative py-20 sm:py-24">
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 24 }}
            whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center"
          >
            <p className="eyebrow text-gold">Trusted by Defence families · Delhi Cantonment</p>
            <h3 className="mx-auto mt-4 max-w-2xl font-display text-2xl font-semibold leading-tight sm:text-3xl">
              Held to the standards officers live by: discipline, punctuality,
              and trust.
            </h3>

            {/* Typographic rank badges - no insignia */}
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
              {RANKS.map((rank) => (
                <span
                  key={rank}
                  className="rounded-xl border border-gold/30 bg-white/[0.03] px-4 py-2.5 font-display text-sm font-semibold tracking-wide text-paper/90 sm:px-5 sm:text-base"
                >
                  {rank}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {DEFENCE_QUOTES.map((r, i) => (
              <Reveal key={r.name} delay={(i % 2) * 90}>
                <figure className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm">
                  <Stars />
                  <blockquote className="mt-4 flex-1 leading-relaxed text-paper/85">
                    “{r.quote}”
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-2 text-sm">
                    <span className="font-display font-semibold text-gold">{r.name}</span>
                    <span className="text-paper/40">·</span>
                    <span className="text-paper/55">{r.area}</span>
                    {r.onFees && (
                      <span className="ml-auto text-[10px] font-bold uppercase tracking-wide text-gold/80">
                        On our fees
                      </span>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </div>

      {/* 4 + 6 · Filter + review wall */}
      <div className="bg-paper">
        <div className="container-mp py-20 sm:py-24">
          <Reveal>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-xl">
                <p className="eyebrow">Every review</p>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight text-ink sm:text-3xl">
                  Real families, real homes, real progress.
                </h3>
              </div>
              {/* Filter tabs */}
              <div
                role="group"
                aria-label="Filter reviews"
                className="flex flex-wrap gap-2"
              >
                {FILTERS.map((f) => {
                  const selected = filter === f.key;
                  return (
                    <button
                      key={f.key}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setFilter(f.key)}
                      className={cn(
                        "relative rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
                        selected ? "text-ink" : "text-ink/60 hover:text-ink"
                      )}
                    >
                      {selected && (
                        <motion.span
                          layoutId={reduced ? undefined : "review-filter-pill"}
                          className="absolute inset-0 rounded-full border border-gold/40 bg-gold/15"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                      <span className="relative">{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </Reveal>

          <motion.div layout={!reduced} className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {visible.map((r) => (
                <motion.div
                  key={r.name}
                  layout={!reduced}
                  initial={reduced ? false : { opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.28, ease: "easeOut" }}
                >
                  <WallCard r={r} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      {/* 5 · Where our families learn */}
      <div className="bg-mist">
        <div className="container-mp py-16 sm:py-20">
          <Reveal>
            <p className="eyebrow text-center">Where our families learn</p>
            <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3">
              {LOCALITIES.map((loc) => (
                <span
                  key={loc}
                  className="inline-flex items-center gap-2 rounded-full border border-hairline bg-white px-4 py-2 text-sm font-medium text-ink/80 shadow-card"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
                    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" stroke="currentColor" strokeWidth="1.8" />
                    <circle cx="12" cy="10" r="2.4" fill="currentColor" />
                  </svg>
                  {loc}
                </span>
              ))}
            </div>
            <p className="mt-6 text-center text-sm text-ink/55">
              Real families, real homes, across Delhi NCR.
            </p>
          </Reveal>
        </div>
      </div>

      {/* 7 · Video stories - hidden until real videos exist (renders null for now) */}
      <ReviewVideos />

      {/* 8 · CTA */}
      <div className="bg-ink text-paper">
        <div className="container-mp py-20 text-center sm:py-24">
          <Reveal>
            <h3 className="mx-auto max-w-2xl font-display text-3xl font-semibold leading-tight sm:text-4xl">
              See why families stay.
            </h3>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-paper/75">
              Start with a free trial class - no commitment, just an honest first
              lesson.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Button href="/start" variant="light" size="lg">
                Book a free trial
              </Button>
              <Button
                href={whatsappTrialLink()}
                external
                variant="secondary"
                size="lg"
                className="border-white/25 text-paper hover:border-white"
              >
                Enquire on WhatsApp
              </Button>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
