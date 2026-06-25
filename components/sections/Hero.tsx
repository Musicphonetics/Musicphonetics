"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { RotatingWords } from "@/components/ui/RotatingWords";
import { CountUp } from "@/components/ui/CountUp";
import { MusicScene } from "@/components/ui/MusicScene";
import { FloatingReviews } from "@/components/sections/FloatingReviews";
import { cn } from "@/lib/utils";

/**
 * Hero 3.0 — a cinematic, living music environment with a film-trailer reveal:
 *   stage 0  the musical environment is alive
 *   stage 1  headline + founder vision fade in
 *   stage 2  CTAs
 *   stage 3  first verified review floats in
 *   stage 4  statistics count up
 * Under reduced-motion everything is shown at once (stage jumps to max).
 */
export function Hero() {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(4);
      return;
    }
    const timers = [
      setTimeout(() => setStage(1), 900),
      setTimeout(() => setStage(2), 1600),
      setTimeout(() => setStage(3), 2600),
      setTimeout(() => setStage(4), 3400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const cue = (need: number) => cn("mp-cue", stage >= need && "mp-cue-in");

  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden bg-ink text-paper lg:min-h-[calc(100vh-4rem)]">
      {/* Background: living music scene */}
      <MusicScene className="absolute inset-0 h-full w-full" />

      {/* Ambient depth lighting */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-[480px] w-[480px] rounded-full bg-deep-gold/20 blur-3xl" />
        <div className="absolute -right-24 bottom-0 h-[420px] w-[420px] rounded-full bg-feature-green/40 blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-transparent to-ink" />
      </div>

      {/* Floating verified reviews */}
      <FloatingReviews visible={stage >= 3} />

      {/* Foreground copy */}
      <div className="container-mp relative z-10 py-20 sm:py-24">
        <div className="max-w-3xl">
          <p className={cn(cue(1), "eyebrow text-gold")}>
            Delhi NCR · Founded in India, built for the world
          </p>

          <h1
            className={cn(
              cue(1),
              "mt-5 text-[2.7rem] font-semibold leading-[1.02] text-paper sm:text-6xl lg:text-7xl"
            )}
            style={{ transitionDelay: "120ms" }}
          >
            Building the future of{" "}
            <span className="mp-shimmer">music education.</span>
          </h1>

          <p
            className={cn(cue(1), "relative mt-5 h-7 text-lg font-medium text-paper/80 sm:text-xl")}
            style={{ transitionDelay: "240ms" }}
          >
            <RotatingWords
              words={[
                "One student at a time.",
                "One structured method.",
                "One trusted network.",
                "One music movement.",
              ]}
              className="relative inline-block"
            />
          </p>

          <p
            className={cn(cue(1), "mt-6 max-w-xl text-base leading-relaxed text-paper/70 sm:text-lg")}
            style={{ transitionDelay: "360ms" }}
          >
            Musicphonetics is an education-first music company. Structured,
            director-led learning today — growing into a global ecosystem of
            students, teachers, artists, and schools.
          </p>

          <div className={cn(cue(2), "mt-8 flex flex-col gap-3 sm:flex-row")}>
            <Magnetic>
              <Button href="/#pathways" size="lg" variant="light">
                Discover your pathway
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                href="/#ecosystem"
                size="lg"
                variant="secondary"
                className="border-white/25 text-paper hover:border-white"
              >
                Explore the ecosystem
              </Button>
            </Magnetic>
          </div>

          {/* Animated statistics */}
          <dl className={cn(cue(2), "mt-12 flex flex-wrap gap-x-10 gap-y-5")}>
            <div>
              <dt className="font-display text-3xl font-semibold text-gold">
                <CountUp value={10} suffix="+" play={stage >= 4} />
              </dt>
              <dd className="text-xs uppercase tracking-wider text-paper/50">
                Years teaching
              </dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-semibold text-gold">
                <CountUp value={1100} suffix="+" play={stage >= 4} />
              </dt>
              <dd className="text-xs uppercase tracking-wider text-paper/50">
                Students taught
              </dd>
            </div>
            <div>
              <dt className="font-display text-3xl font-semibold text-gold">
                Director-led
              </dt>
              <dd className="text-xs uppercase tracking-wider text-paper/50">
                Method
              </dd>
            </div>
          </dl>

          <p className={cn(cue(3), "mt-6 text-xs text-paper/40")}>
            Sample reviews shown · verified parent testimonials added at launch
          </p>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden="true"
        className={cn(
          cue(4),
          "absolute bottom-6 left-1/2 -translate-x-1/2 text-paper/40"
        )}
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="animate-bounce">
          <path d="M12 5v14M6 13l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
