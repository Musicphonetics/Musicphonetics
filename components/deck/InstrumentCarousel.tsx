"use client";

import { useRef, useState } from "react";
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

// Active instrument is dominant; the neighbours peek at the edges. A horizontal
// swipe (or tap on a neighbour) glides to the next — nothing stacks vertically,
// and the vertical deck gesture is untouched (we only act on horizontal drags).
export function InstrumentCarousel() {
  const [i, setI] = useState(0);
  const [drag, setDrag] = useState(0); // live finger offset, px (visual only)
  const [anim, setAnim] = useState(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const horiz = useRef(false);
  const dragRef = useRef(0); // authoritative offset for the release decision
  const n = INSTRUMENTS.length;
  const at = (k: number) => INSTRUMENTS[(k + n) % n];
  const cur = at(i);
  const active = (((i % n) + n) % n);

  const move = (dir: number) => { setAnim(true); setI((v) => v + dir); dragRef.current = 0; setDrag(0); };

  const onStart = (e: React.TouchEvent) => {
    start.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    horiz.current = false; dragRef.current = 0; setAnim(false);
  };
  const onMove = (e: React.TouchEvent) => {
    if (!start.current) return;
    const dx = e.touches[0].clientX - start.current.x;
    const dy = e.touches[0].clientY - start.current.y;
    if (!horiz.current && Math.abs(dx) > 8 && Math.abs(dx) > Math.abs(dy)) horiz.current = true;
    if (horiz.current) { e.stopPropagation(); dragRef.current = dx; setDrag(dx); }
  };
  const onEnd = () => {
    if (horiz.current && Math.abs(dragRef.current) > 45) move(dragRef.current < 0 ? 1 : -1);
    else { setAnim(true); dragRef.current = 0; setDrag(0); }
    start.current = null; horiz.current = false;
  };

  return (
    <div className="flex select-none flex-col items-center text-center">
      <div
        className="flex w-full touch-pan-y items-center justify-center gap-4"
        onTouchStart={onStart} onTouchMove={onMove} onTouchEnd={onEnd}
      >
        <button onClick={() => move(-1)} aria-label="Previous" className="shrink-0 text-4xl text-paper/25 transition hover:text-paper/60">{at(i - 1).icon}</button>
        <div className="min-w-0 flex-1 overflow-hidden">
          <div
            style={{ transform: `translateX(${drag}px)`, opacity: 1 - Math.min(Math.abs(drag) / 260, 0.55), transition: anim ? "transform .38s cubic-bezier(.22,1,.36,1), opacity .38s ease" : "none" }}
          >
            <div className="text-[5.5rem] leading-none">{cur.icon}</div>
            <p className="mt-3 font-display text-4xl font-black text-paper">{cur.key}</p>
            <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-paper/65">{LINE[cur.key] || "Learn it the right way, from day one."}</p>
          </div>
        </div>
        <button onClick={() => move(1)} aria-label="Next" className="shrink-0 text-4xl text-paper/25 transition hover:text-paper/60">{at(i + 1).icon}</button>
      </div>

      <div className="mt-6 flex justify-center gap-2">
        {INSTRUMENTS.map((x, k) => (
          <button key={x.key} aria-label={x.key} onClick={() => { setAnim(true); setI(k); setDrag(0); }}
            className={"h-1.5 rounded-full transition-all " + (k === active ? "w-6 bg-gold" : "w-1.5 bg-white/25 hover:bg-white/50")} />
        ))}
      </div>

      <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-paper/35">← Swipe to change →</p>

      <Link href={`/studio?instrument=${encodeURIComponent(cur.key)}`} className="mt-5 rounded-full bg-gold px-7 py-3.5 text-sm font-bold text-ink transition hover:bg-[#f0d783]">
        Start with {cur.key} →
      </Link>
    </div>
  );
}
