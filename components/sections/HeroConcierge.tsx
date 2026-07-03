"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { CountUp } from "@/components/ui/CountUp";
import { HERO_STUDENTS as HERO_IMAGE } from "@/lib/media";

const STATS: { value?: number; suffix?: string; text?: string; label: string }[] = [
  { value: 1100, suffix: "+", label: "Students" },
  { value: 200, suffix: "+", label: "Exam successes" },
  { value: 10, suffix: "+", label: "Years" },
  { text: "Personal", label: "Attention" },
];

function StatCard() {
  return (
    <div className="mp-glass grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl sm:grid-cols-4 sm:p-6">
      {STATS.map((s) => (
        <div key={s.label} className="text-center sm:text-left">
          <p className="font-display text-2xl font-semibold text-gold sm:text-3xl">
            {s.value != null ? <CountUp value={s.value} suffix={s.suffix} /> : s.text}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-wide text-paper/70">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

function TrinityBadge() {
  const Laurel = ({ flip }: { flip?: boolean }) => (
    <svg width="16" height="22" viewBox="0 0 16 22" fill="none" aria-hidden="true" className="text-gold" style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M13 2C7 4 4 9 4 15c0 2 .5 4 1.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      {[4, 7, 10, 13].map((y) => (
        <path key={y} d={`M${12 - (y - 4) * 0.4} ${y}c-2 .3-3.6 1.4-4.3 3`} stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      ))}
    </svg>
  );
  return (
    <div className="inline-flex items-center gap-2 text-paper/80">
      <Laurel />
      <span className="text-xs font-medium uppercase tracking-[0.18em]">Trinity-recognised · 200+ exam successes</span>
      <Laurel flip />
    </div>
  );
}

export function HeroConcierge() {
  const reduced = useReducedMotion();
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const raf = useRef<number | null>(null);

  // Gentle desktop mouse parallax on the hero image.
  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      if (window.innerWidth < 1024) return;
      if (raf.current) cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * 16;
        const y = (e.clientY / window.innerHeight - 0.5) * 12;
        setOffset({ x, y });
      });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMove);
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [reduced]);

  const rise = (delay: number) =>
    reduced
      ? {}
      : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.5, delay, ease: "easeOut" as const } };

  return (
    <section id="overview" className="relative overflow-hidden bg-ink text-paper">
      {/* Desktop full-bleed image on the right */}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-[57%] lg:block">
        <div
          className="absolute -inset-[5%] origin-center"
          style={{
            transform: `translate3d(${offset.x}px, ${offset.y}px, 0)`,
            transition: reduced ? undefined : "transform 0.6s ease-out",
          }}
        >
          <Image
            src={HERO_IMAGE.src}
            alt={HERO_IMAGE.alt}
            fill
            priority
            sizes="60vw"
            placeholder="blur"
            blurDataURL={HERO_IMAGE.blurDataURL}
            className={reduced ? "object-cover object-[50%_38%]" : "object-cover object-[50%_38%] mp-hero-zoom"}
            style={{ filter: "brightness(1.04) contrast(1.07) saturate(1.06)" }}
          />
        </div>
        {/* Readability gradient (right → left) + warm gold + vignette */}
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/55 to-transparent" />
        <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(120% 100% at 72% 42%, transparent, rgba(11,15,24,0.45))" }} />
      </div>

      <div className="container-mp relative">
        <div className="flex flex-col py-10 sm:py-14 lg:grid lg:min-h-[90vh] lg:grid-cols-2 lg:items-center lg:py-0">
          <div className="flex max-w-xl flex-col lg:py-24">
            {/* Mobile image first */}
            <div className="order-1 mb-7 overflow-hidden rounded-2xl border border-white/10 shadow-card-hover lg:hidden">
              <div className="relative aspect-[5/4]">
                <Image
                  src={HERO_IMAGE.src}
                  alt={HERO_IMAGE.alt}
                  fill
                  priority
                  sizes="100vw"
                  placeholder="blur"
                  blurDataURL={HERO_IMAGE.blurDataURL}
                  className="object-cover object-[50%_40%]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/45 to-transparent" />
              </div>
            </div>

            <motion.h1 {...rise(0.05)} className="order-2 font-display text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              Music education that <span className="text-gold">hits</span> the right note.
            </motion.h1>

            <motion.p {...rise(0.15)} className="order-3 mt-5 max-w-md text-base leading-relaxed text-paper/80 sm:text-lg">
              Personalized music education for children and adults — home lessons,
              online learning, and our premium South Delhi centre.
            </motion.p>

            <motion.div {...rise(0.28)} className="order-4 mt-8 flex flex-col gap-3 sm:flex-row">
              <Button href="/start" variant="light" size="lg" className="px-9 py-4 text-base shadow-card-hover">
                Book a Free Trial
              </Button>
              <Button href="#performances" variant="secondary" size="lg" className="border-white/25 text-paper hover:border-white">
                Watch Our Story
              </Button>
            </motion.div>

            <motion.div {...rise(0.42)} className="order-5 mt-9 lg:max-w-lg">
              <StatCard />
            </motion.div>

            <motion.div {...rise(0.55)} className="order-6 mt-6">
              <TrinityBadge />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
