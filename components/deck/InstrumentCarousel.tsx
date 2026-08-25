"use client";

import { useState } from "react";
import Link from "next/link";
import { INSTRUMENTS } from "@/lib/journey";

const LINE: Record<string, string> = {
  Guitar: "Chords, rhythm, and the songs you love — acoustic or electric.",
  Piano: "Both hands, real music, from your very first note.",
  Keyboard: "Sounds, chords and songs — versatile and endlessly fun.",
  Vocals: "Your own voice — pitch, tone, breath and confidence.",
  Ukulele: "The happiest four strings — playing songs in weeks.",
  Drums: "Groove, timing and pure energy behind the kit.",
};

// Active instrument is dominant; the neighbours peek at the edges. Swipe/tap
// moves to the next — nothing stacks vertically.
export function InstrumentCarousel() {
  const [i, setI] = useState(0);
  const n = INSTRUMENTS.length;
  const at = (k: number) => INSTRUMENTS[(k + n) % n];
  const cur = at(i);

  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex w-full items-center justify-center gap-4">
        <button onClick={() => setI(i - 1)} aria-label="Previous" className="text-4xl text-paper/25 transition hover:text-paper/60">{at(i - 1).icon}</button>
        <div className="min-w-0 flex-1">
          <div className="text-[5.5rem] leading-none">{cur.icon}</div>
          <p className="mt-3 font-display text-4xl font-black text-paper">{cur.key}</p>
          <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-paper/65">{LINE[cur.key] || "Learn it the right way, from day one."}</p>
        </div>
        <button onClick={() => setI(i + 1)} aria-label="Next" className="text-4xl text-paper/25 transition hover:text-paper/60">{at(i + 1).icon}</button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {INSTRUMENTS.map((x, k) => (
          <button key={x.key} aria-label={x.key} onClick={() => setI(k)}
            className={"h-1.5 rounded-full transition-all " + (k === ((i % n) + n) % n ? "w-6 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/50")} />
        ))}
      </div>

      <Link href={`/studio?instrument=${encodeURIComponent(cur.key)}`} className="mt-8 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-[#f0d783]">
        Start with {cur.key} →
      </Link>
    </div>
  );
}
