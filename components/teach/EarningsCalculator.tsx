"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { Section, SectionHeading } from "@/components/ui/Section";
import { formatINR } from "@/lib/utils";
import { calcIncome, PACKAGE_OPTIONS, type PackageKey } from "@/lib/teach-econ";
import { cn } from "@/lib/utils";

const MAX_MONTHLY = calcIncome(12, "transformation").monthly; // bar reference

function useTweened(value: number): number {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  useEffect(() => {
    if (reduced) { setDisplay(value); return; }
    const from = fromRef.current;
    const start = performance.now();
    const dur = 500;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, reduced]);
  return display;
}

export function EarningsCalculator() {
  const [students, setStudents] = useState(8);
  const [pkg, setPkg] = useState<PackageKey>("blended");
  const r = calcIncome(students, pkg);
  const monthly = useTweened(r.monthly);
  const barPct = Math.max(6, Math.round((r.monthly / MAX_MONTHLY) * 100));

  return (
    <Section background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Earnings calculator"
        title="See what a full roster could look like."
        intro="A projection tool — not a guarantee. Move the slider and switch packages to explore."
      />

      <div className="mt-10 grid gap-6 rounded-3xl border border-hairline bg-white p-6 shadow-card sm:p-8 lg:grid-cols-2 lg:gap-12">
        {/* Controls */}
        <div>
          <label className="block">
            <span className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-ink">Students on your roster</span>
              <span className="font-display text-2xl font-semibold text-[#7A5E0F]">{students}</span>
            </span>
            <input
              type="range" min={1} max={12} value={students}
              onChange={(e) => setStudents(Number(e.target.value))}
              className="mt-3 w-full accent-gold"
              aria-label="Number of students"
            />
            <span className="mt-1 flex justify-between text-xs text-ink/70"><span>1</span><span>12</span></span>
          </label>

          <div className="mt-7">
            <span className="text-sm font-semibold text-ink">Package mix</span>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PACKAGE_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => setPkg(o.key)}
                  className={cn(
                    "rounded-xl border px-2 py-3 text-center transition-colors",
                    pkg === o.key ? "border-gold bg-gold/10 text-ink" : "border-hairline bg-paper text-ink/70 hover:border-ink/30"
                  )}
                >
                  <span className="block text-sm font-semibold">{o.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-tight text-ink/65">{o.note}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-7 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-hairline bg-paper p-4">
              <div className="text-ink/65">Classes / month</div>
              <div className="mt-1 font-display text-xl font-semibold text-ink">{r.classesPerMonth}</div>
            </div>
            <div className="rounded-xl border border-hairline bg-paper p-4">
              <div className="text-ink/65">Your share / class</div>
              <div className="mt-1 font-display text-xl font-semibold text-ink">{formatINR(r.share)}</div>
            </div>
          </div>
        </div>

        {/* Output + bar */}
        <div className="flex gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7A5E0F]">Projected monthly income</p>
            <p className="mt-1 font-display text-4xl font-semibold text-ink sm:text-5xl">{formatINR(monthly)}</p>
            <p className="mt-2 text-sm text-ink/60">Projected annual · {formatINR(r.annual)}</p>
            <p className="mt-6 max-w-sm text-xs leading-relaxed text-ink/65">
              Projected, illustrative. Based on {8} classes per student per month
              and a 70% share. Your roster builds over the first weeks — this is a
              planning tool, not a guarantee.
            </p>
          </div>
          {/* Growing bar */}
          <div className="flex w-14 flex-col justify-end" aria-hidden="true">
            <div className="relative h-56 w-full overflow-hidden rounded-full bg-mist">
              <div
                className="absolute bottom-0 w-full rounded-full bg-gradient-to-t from-deep-gold to-gold transition-[height] duration-500 ease-out"
                style={{ height: `${barPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
