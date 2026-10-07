"use client";

import { useEffect, useRef, useState } from "react";
import { Reveal } from "@/components/ui/Reveal";

// ============================================================================
// LivingSystem — scroll 2, the heart of the page. Instead of *describing* the
// learning loop, it runs it: one real class is logged and we watch that single
// packet of data travel through every stage of the system — teacher, student
// record, parent, assessment, intelligence, next lesson — lighting each node as
// it arrives, then looping. Every field shown is real data the platform captures
// today (Aarav's record, the actual logged fields). The two stages that don't
// exist yet are honestly tagged "Building". Nothing here is a mockup dashboard.
//
// It self-plays with a client sequencer, starts when scrolled into view, and
// collapses to a fully-lit, static read for reduced-motion / no-JS.
// ============================================================================

type Stage = {
  k: string;
  title: string;
  system: string;
  line: string;
  chips: string[];
  live: boolean;
  d: string; // icon path
};

const STAGES: Stage[] = [
  {
    k: "01",
    title: "A class is taught — and logged",
    system: "Teacher OS · live",
    line: "The teacher records exactly what happened, while it's still fresh.",
    chips: ["Taught: barre chords — F & B♭", "Accuracy 80%", "Struggled: B-string change", "Practice set: 20 min/day"],
    live: true,
    d: "M12 4L3 8l9 4 9-4-9-4zM6 10v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4",
  },
  {
    k: "02",
    title: "It attaches to the student",
    system: "Student records · live",
    line: "Not a message that scrolls away — it lands on the student, permanently.",
    chips: ["Aarav Kapoor · MP-2026-000004", "Class 5 of 8 this cycle", "Subject & attendance logged"],
    live: true,
    d: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0",
  },
  {
    k: "03",
    title: "The parent sees it",
    system: "Parent OS · live",
    line: "No chasing for updates. Where their child stands is simply there.",
    chips: ["Progress: on track", "A written report each month", "Fees, clearly accounted"],
    live: true,
    d: "M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z",
  },
  {
    k: "04",
    title: "It becomes assessment data",
    system: "Structured record · live",
    line: "Every class adds to a structured picture of how this student is learning.",
    chips: ["Technique · rhythm · ear", "Theory · expression", "Measured, class over class"],
    live: true,
    d: "M4 4h16v16H4zM8 4v16M4 9h4M4 14h4",
  },
  {
    k: "05",
    title: "The intelligence layer reads it",
    system: "Intelligence · building",
    line: "The layer we're building turns that record into real understanding.",
    chips: ["A competency score", "A skill graph per instrument", "Benchmarks across the network"],
    live: false,
    d: "M12 3a3 3 0 013 3 3 3 0 01-.3 1.3A3 3 0 0117 10a3 3 0 01-1 5.6V17a3 3 0 11-6 0v-1.4A3 3 0 017 10a3 3 0 012.3-2.7A3 3 0 019 6a3 3 0 013-3z",
  },
  {
    k: "06",
    title: "The next lesson is personalised",
    system: "Intelligence · building",
    line: "It decides what this student should do next — the teacher always in the loop.",
    chips: ["Next: B♭ transition drills", "An adaptive practice plan", "Handed back to the teacher ↺"],
    live: false,
    d: "M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 13a7.9 7.9 0 000-2l2-1.6-2-3.4-2.4 1a7.5 7.5 0 00-1.7-1L14.9 3h-5.8l-.4 2.6a7.5 7.5 0 00-1.7 1l-2.4-1-2 3.4L2.6 11a7.9 7.9 0 000 2l-2 1.6 2 3.4 2.4-1a7.5 7.5 0 001.7 1l.4 2.4h5.8l.4-2.6a7.5 7.5 0 001.7-1l2.4 1 2-3.4-2-1.6z",
  },
];

const DWELL = 2100; // ms each stage holds the signal

export function LivingSystem() {
  const sectionRef = useRef<HTMLElement>(null);
  const spineRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const [active, setActive] = useState(0);
  const [positions, setPositions] = useState<number[]>([]);
  const [reduced, setReduced] = useState(false);
  const [running, setRunning] = useState(false);

  // Respect reduced-motion: show everything lit, no travelling signal.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener?.("change", set);
    return () => mq.removeEventListener?.("change", set);
  }, []);

  // Measure the vertical centre of each node dot so the signal can ride the spine.
  useEffect(() => {
    const measure = () => {
      const spine = spineRef.current;
      if (!spine) return;
      const top = spine.getBoundingClientRect().top;
      setPositions(
        dotRefs.current.map((d) => {
          if (!d) return 0;
          const r = d.getBoundingClientRect();
          return r.top - top + r.height / 2;
        })
      );
    };
    measure();
    window.addEventListener("resize", measure);
    const t = setTimeout(measure, 300); // after fonts/layout settle
    return () => { window.removeEventListener("resize", measure); clearTimeout(t); };
  }, []);

  // Only run the sequence while the section is on screen.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => setRunning(e.isIntersecting),
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // The sequencer.
  useEffect(() => {
    if (reduced || !running) return;
    const id = setInterval(() => setActive((a) => (a + 1) % STAGES.length), DWELL);
    return () => clearInterval(id);
  }, [reduced, running]);

  const signalTop = positions[active] ?? 0;
  const activeStage = STAGES[active];

  return (
    <section
      id="loop"
      ref={sectionRef}
      className="scroll-mt-28 relative overflow-hidden bg-charcoal py-20 text-ivory sm:py-28"
    >
      <div aria-hidden="true" className="pointer-events-none absolute left-[-10vw] top-1/3 h-[32rem] w-[32rem] rounded-full bg-gold/[0.06] blur-[140px]" />

      <div className="container-mp relative">
        {/* Header */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" />
            </span>
            The system, live
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.1rem)] font-medium leading-[1.08]">
            Watch one class move through the whole system.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[1rem] leading-relaxed text-ivory/65">
            Not a diagram of an idea. This is the data the platform captures on a real student
            today — and the intelligence layer being built on top of it.
          </p>
          <div className="mt-6 flex items-center justify-center gap-5 text-[0.72rem] font-medium text-ivory/55">
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" /> Live today</span>
            <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full border border-gold/70" /> Being built</span>
          </div>
        </Reveal>

        {/* The living spine */}
        <div ref={spineRef} className="relative mx-auto mt-14 max-w-xl">
          {/* static rail */}
          <span aria-hidden="true" className="absolute left-[21px] top-3 bottom-3 w-px bg-gradient-to-b from-gold/50 via-gold/25 to-gold/10" />
          {/* charged rail up to the signal */}
          {!reduced && (
            <span
              aria-hidden="true"
              className="absolute left-[21px] top-3 w-px bg-gradient-to-b from-gold/70 to-gold transition-[height] duration-700 ease-out"
              style={{ height: `${Math.max(signalTop - 12, 0)}px` }}
            />
          )}
          {/* the travelling signal */}
          {!reduced && positions.length > 0 && (
            <span
              aria-hidden="true"
              className="absolute left-[21px] z-20 -translate-x-1/2 transition-[top] duration-700 ease-out"
              style={{ top: `${signalTop}px` }}
            >
              <span className="relative flex h-3.5 w-3.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/70" />
                <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-gold shadow-[0_0_16px_4px_rgba(201,162,39,0.6)]" />
              </span>
            </span>
          )}

          <ul className="space-y-4">
            {STAGES.map((s, i) => {
              const lit = reduced || i === active;
              return (
                <li key={s.k}>
                  <div className="flex items-start gap-4 sm:gap-5">
                    {/* node dot */}
                    <span
                      ref={(el) => { dotRefs.current[i] = el; }}
                      className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-500 ${
                        s.live
                          ? lit ? "border-emerald-400/70 bg-emerald-400/20 shadow-[0_0_0_4px_rgba(52,211,153,0.10)]" : "border-emerald-400/30 bg-emerald-400/[0.06]"
                          : lit ? "border-gold/70 bg-gold/20 shadow-[0_0_0_4px_rgba(201,162,39,0.10)]" : "border-gold/30 bg-gold/[0.06]"
                      }`}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className={`transition-colors duration-500 ${s.live ? (lit ? "text-emerald-200" : "text-emerald-300/70") : lit ? "text-gold-soft" : "text-gold/60"}`}>
                        <path d={s.d} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>

                    {/* node card */}
                    <div
                      className={`flex-1 rounded-2xl border px-4 py-3.5 transition-all duration-500 sm:px-5 ${
                        lit
                          ? "border-ivory/20 bg-ivory/[0.06] shadow-[0_10px_40px_-18px_rgba(0,0,0,0.8)]"
                          : "border-ivory/10 bg-ivory/[0.02]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-display text-lg font-medium leading-tight text-ivory">{s.title}</p>
                          <p className="mt-0.5 text-[0.68rem] font-medium uppercase tracking-[0.12em] text-ivory/40">{s.system}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[0.62rem] font-semibold uppercase tracking-wide ${s.live ? "bg-emerald-400/12 text-emerald-300" : "border border-gold/40 text-gold-soft"}`}>
                          {s.live ? "Live" : "Building"}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[0.9rem] leading-relaxed text-ivory/60">{s.line}</p>

                      {/* the real data payload riding through */}
                      <div
                        className={`grid transition-all duration-500 ease-out ${lit ? "mt-3 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                      >
                        <div className="overflow-hidden">
                          <div className="flex flex-wrap gap-1.5">
                            {s.chips.map((c) => (
                              <span
                                key={c}
                                className={`rounded-md border px-2 py-1 text-[0.72rem] font-medium ${
                                  s.live
                                    ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-100/90"
                                    : "border-gold/25 bg-gold/[0.06] text-gold-soft"
                                }`}
                              >
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* loop-back cap */}
          <div className="relative mt-6 flex items-start gap-4 sm:gap-5">
            <span className="relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full border border-gold/50 bg-charcoal-2 text-gold">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M3 12a9 9 0 019-9 9 9 0 018 5M21 12a9 9 0 01-9 9 9 9 0 01-8-5M17 8h4V4M7 16H3v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </span>
            <p className="pt-2.5 text-[0.9rem] font-medium text-ivory/70">
              <span className="text-gold-soft">And the next class begins</span> — the system a little
              sharper each time it goes round.
            </p>
          </div>
        </div>

        {/* Live caption under the system — names exactly what the signal is doing now */}
        <div className="mx-auto mt-10 max-w-xl text-center">
          <p className="text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ivory/40">
            {reduced ? "The full loop, every class" : "Now flowing"}
          </p>
          <p className="mt-1.5 min-h-[1.5rem] text-[0.95rem] text-ivory/70" aria-live="off">
            {reduced
              ? "Every class a student takes runs this entire loop."
              : <><span className={activeStage.live ? "text-emerald-300" : "text-gold-soft"}>●</span> {activeStage.title}</>}
          </p>
        </div>
      </div>
    </section>
  );
}
