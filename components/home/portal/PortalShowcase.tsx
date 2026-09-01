"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { JourneyScreen, LessonPlanScreen, ProgressScreen, HomeScreen, FeesScreen } from "./frames";
import { PortalReport } from "./PortalReport";
import { SectionHeader } from "../SectionHeader";
import { Reveal } from "@/components/ui/Reveal";

// How Musicphonetics works, shown through the Student Portal. One section that
// both explains the method and showcases the portal. Same house pattern as the
// "how it works" band: a headline, then numbered cards that peek and swipe on
// mobile and settle into a grid on desktop. The heading and first card are
// visible on a normal scroll, so a first-time visitor gets the point without
// having to know to swipe; the peek simply invites them to see more.

type Card = { num: string; kicker: string; title: string; body: string } & (
  | { kind: "phone"; Comp: () => JSX.Element }
  | { kind: "report" }
);

const CARDS: Card[] = [
  { num: "01", kicker: "The right fit", title: "A teacher matched to your child", body: "We pair a teacher to your child's age, instrument and goal, then track the whole journey in your portal.", kind: "phone", Comp: JourneyScreen },
  { num: "02", kicker: "A real curriculum", title: "Every class has a purpose", body: "Every month has a goal, and every class moves towards it, written out in a clear lesson plan.", kind: "phone", Comp: LessonPlanScreen },
  { num: "03", kicker: "Always clear", title: "See exactly where they stand", body: "Classes done, days remaining, on track or needs attention. No more wondering how it is going.", kind: "phone", Comp: ProgressScreen },
  { num: "04", kicker: "Documented", title: "A real report every month", body: "What your child learned, achieved and works on next, in a written report you keep.", kind: "report" },
  { num: "05", kicker: "One place", title: "Everything, without the chaos", body: "Classes, updates, homework, reports and fees, without the endless WhatsApp messages.", kind: "phone", Comp: HomeScreen },
  { num: "06", kicker: "No guesswork", title: "Fees that make sense", body: "Each payment covers a set of classes, so you always know what is paid and what is next.", kind: "phone", Comp: FeesScreen },
];

export function PortalShowcase() {
  const visRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Scale the phone UI to fill each card's width (cards are uniform per row).
  useEffect(() => {
    const fit = () => { const w = visRef.current?.clientWidth || 314; setScale(w / 314); };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section id="how" className="scroll-mt-16 overflow-hidden bg-charcoal-2 py-20 md:py-28">
      <div className="container-mp">
        <SectionHeader
          eyebrow="How Musicphonetics works"
          title="A clear path, and a portal to see it."
          sub="Every part of the method lives in one place, your Student Portal, so you always know exactly how your child is doing."
          invert
        />

        <div role="region" aria-label="How Musicphonetics works" tabIndex={0}
          className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-3 [scrollbar-width:none] focus-visible:outline-none [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
          {CARDS.map((c, i) => (
            <Reveal key={c.title} delay={(i % 3) * 70}>
              <article className="flex h-full w-[82vw] max-w-[330px] shrink-0 snap-center flex-col overflow-hidden rounded-2xl border border-white/10 bg-charcoal sm:w-auto sm:max-w-none">
                {/* Visual: a framed peek at the actual portal screen */}
                <div ref={i === 0 ? visRef : undefined} className="relative aspect-[4/5] w-full overflow-hidden bg-charcoal-2">
                  {c.kind === "phone" ? (
                    <div className="absolute inset-x-0 top-0 flex justify-center" style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
                      <c.Comp />
                    </div>
                  ) : (
                    <div className="absolute inset-x-0 top-0 px-3 pt-3"><PortalReport /></div>
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(to_top,rgba(35,40,52,0.96),transparent_40%)]" />
                  <span className="absolute bottom-3 left-4 font-display text-2xl font-medium text-gold">{c.num}</span>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <span className="text-[0.68rem] font-medium uppercase tracking-[0.16em] text-gold">{c.kicker}</span>
                  <h3 className="mt-2 font-display text-xl font-medium leading-snug text-ivory">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ivory/65">{c.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal>
          <p className="mx-auto mt-11 max-w-xl text-center text-[1rem] leading-relaxed text-ivory/70">
            Not just music lessons. A complete learning journey you can actually see, and a{" "}
            <Link href="/studio" className="font-semibold text-gold underline decoration-gold/50 underline-offset-4 hover:decoration-gold">free trial</Link>{" "}
            to begin it.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
