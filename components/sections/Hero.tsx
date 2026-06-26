"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Magnetic } from "@/components/ui/Magnetic";
import { whatsappLink, whatsappTrialLink } from "@/lib/data";
import { INDIA_CITIES, GLOBAL_CITIES } from "@/lib/geo";
import { cn } from "@/lib/utils";

/**
 * Hero — cinematic India→global sequence:
 *   0  city lights rise from Indian cities (pulsing like sound waves)
 *   1  thin golden staff lines connect the cities
 *   2  a glowing "M" forms over the map
 *   3  the "M" resolves into the Musicphonetics wordmark
 *   4  the camera zooms out from India to a global map; new lights appear
 *   5  hero text + CTAs
 * Under reduced-motion the final state (5) is shown immediately.
 */
export function Hero() {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setPhase(5);
      return;
    }
    const timers = [
      setTimeout(() => setPhase(1), 1300),
      setTimeout(() => setPhase(2), 2200),
      setTimeout(() => setPhase(3), 3000),
      setTimeout(() => setPhase(4), 3900),
      setTimeout(() => setPhase(5), 4700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Connecting lines among Indian cities (suggesting musical staff lines).
  const hub = INDIA_CITIES.find((c) => c.name === "Delhi")!;

  return (
    <section className="relative flex min-h-[640px] items-center overflow-hidden bg-ink text-paper lg:min-h-[calc(100vh-4rem)]">
      {/* Ambient depth */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/3 top-0 h-[460px] w-[460px] rounded-full bg-deep-gold/15 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-[420px] w-[420px] rounded-full bg-feature-green/40 blur-3xl" />
      </div>

      {/* ===== Map stage ===== */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        {/* World layer (revealed on zoom-out) */}
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-[1200ms]",
            phase >= 4 ? "opacity-100" : "opacity-0"
          )}
          style={{
            backgroundImage:
              "radial-gradient(rgba(246,244,239,0.10) 1.2px, transparent 1.2px)",
            backgroundSize: "26px 26px",
          }}
        >
          {GLOBAL_CITIES.map((c, i) => (
            <span
              key={c.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.x}%`, top: `${c.y}%`, transitionDelay: `${i * 120}ms` }}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gold/60" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-gold" />
              </span>
              <span className="absolute left-3 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] text-paper/60">
                {c.name}
              </span>
            </span>
          ))}
        </div>

        {/* India layer (scales down + shifts on zoom-out) */}
        <div
          className="absolute inset-0 transition-transform duration-[1400ms] ease-in-out"
          style={{
            transform:
              phase >= 4 ? "scale(0.4) translate(36%, 8%)" : "scale(1) translate(0,0)",
          }}
        >
          {/* Staff lines */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
            {INDIA_CITIES.filter((c) => c.name !== "Delhi").map((c, i) => (
              <line
                key={c.name}
                x1={hub.x}
                y1={hub.y}
                x2={c.x}
                y2={c.y}
                stroke="#C9A227"
                strokeWidth="0.18"
                pathLength={1}
                style={{
                  strokeDasharray: 1,
                  strokeDashoffset: phase >= 1 ? 0 : 1,
                  opacity: phase >= 1 ? 0.5 : 0,
                  transition: `stroke-dashoffset 1s ease-out ${i * 60}ms, opacity 0.6s ease ${i * 60}ms`,
                }}
              />
            ))}
          </svg>

          {/* City lights */}
          {INDIA_CITIES.map((c, i) => (
            <span
              key={c.name}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${c.x}%`, top: `${c.y}%` }}
            >
              <span
                className="relative flex h-3 w-3"
                style={{
                  opacity: phase >= 0 ? 1 : 0,
                  animation: `mp-rise 0.6s ease-out ${i * 90}ms both`,
                }}
              >
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-gold/50"
                  style={{ animation: `mp-pulse 2.4s ease-in-out ${i * 120}ms infinite` }}
                />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-gold shadow-[0_0_8px_rgba(201,162,39,0.8)]" />
              </span>
              <span
                className="absolute left-3.5 top-1/2 -translate-y-1/2 whitespace-nowrap text-[10px] font-medium text-paper/70 transition-opacity duration-500"
                style={{ opacity: phase >= 0 && phase < 4 ? 1 : 0 }}
              >
                {c.name}
              </span>
            </span>
          ))}

          {/* The forming "M" → wordmark */}
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span
              className="font-display font-semibold text-gold transition-all duration-700"
              style={{
                fontSize: "min(34vw, 22rem)",
                opacity: phase === 2 ? 0.92 : 0,
                transform: phase >= 3 ? "scale(1.15)" : "scale(1)",
                filter: "drop-shadow(0 0 30px rgba(201,162,39,0.45))",
              }}
            >
              M
            </span>
          </div>
        </div>

        {/* Centered wordmark reveal (phase 3) */}
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center transition-all duration-700"
          style={{
            opacity: phase === 3 ? 1 : 0,
            transform: phase >= 4 ? "scale(0.9) translateY(-6%)" : "scale(1)",
          }}
        >
          <span className="font-display text-4xl font-semibold tracking-tight text-gold sm:text-6xl">
            Musicphonetics
          </span>
        </div>

        {/* Vignette + bottom fade for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-ink/50" />
      </div>

      {/* ===== Foreground copy ===== */}
      <div className="container-mp relative z-10 py-20 sm:py-24">
        <div
          className="max-w-2xl transition-all duration-1000"
          style={{
            opacity: phase >= 5 ? 1 : 0,
            transform: phase >= 5 ? "translateY(0)" : "translateY(16px)",
          }}
        >
          <p className="eyebrow text-gold">Education-first music company</p>
          <h1 className="mt-5 text-[2.6rem] font-semibold leading-[1.04] text-paper sm:text-6xl lg:text-7xl">
            Building the future of{" "}
            <span className="mp-shimmer">music education.</span>
          </h1>
          <p className="mt-5 text-lg text-paper/75 sm:text-xl">
            Founded in India. Teaching across cities. Expanding globally.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Magnetic>
              <Button href={whatsappTrialLink()} external size="lg" variant="light">
                Book a Trial
              </Button>
            </Magnetic>
            <Magnetic>
              <Button
                href={whatsappLink()}
                external
                size="lg"
                variant="secondary"
                className="border-white/25 text-paper hover:border-white"
              >
                Enquire on WhatsApp
              </Button>
            </Magnetic>
          </div>
        </div>
      </div>
    </section>
  );
}
