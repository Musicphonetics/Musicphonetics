"use client";

import { useEffect, useRef } from "react";
import { CONTINENTS, MAP_W, MAP_H } from "@/components/ui/WorldMap";

// Map-space coordinates (0..1000 × 0..480) matching the continent silhouettes.
const ORIGIN = { x: 700, y: 210 }; // India
const TARGETS = [
  { x: 645, y: 205 }, // Dubai
  { x: 498, y: 112 }, // United Kingdom
  { x: 208, y: 98 }, // Canada
  { x: 765, y: 272 }, // Malaysia
  { x: 778, y: 296 }, // Singapore
  { x: 862, y: 360 }, // Australia
];

interface Particle { x: number; y: number; vx: number; vy: number; r: number; a: number; }

/**
 * Cinematic hero canvas — an abstract world map where India glows as origin and
 * golden "signal" pulses travel outward along arcs, like music data crossing
 * the world. Sound particles drift; the map parallaxes gently with the cursor.
 * Performant (Path2D, capped, DPR-aware, pauses off-screen). Static frame under
 * reduced-motion.
 */
export function HeroCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    const paths = CONTINENTS.map((d) => new Path2D(d));

    let cw = 0, ch = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let scale = 1, offX = 0, offY = 0;
    let particles: Particle[] = [];
    let t = 0;
    let raf = 0;
    let running = true;

    // Cursor parallax (target vs eased)
    const par = { tx: 0, ty: 0, x: 0, y: 0 };

    function layout() {
      const rect = canvas!.getBoundingClientRect();
      cw = rect.width; ch = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(cw * dpr);
      canvas!.height = Math.floor(ch * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Cover the stage, anchored slightly right so India sits centre-right.
      scale = Math.max(cw / MAP_W, ch / MAP_H) * 1.08;
      offX = (cw - MAP_W * scale) / 2 + cw * 0.1;
      offY = (ch - MAP_H * scale) / 2;

      const n = Math.min(48, Math.max(20, Math.round((cw * ch) / 26000)));
      particles = Array.from({ length: n }, () => ({
        x: Math.random() * cw, y: Math.random() * ch,
        vx: (Math.random() - 0.5) * 0.18, vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.5 + 0.6, a: Math.random() * 0.5 + 0.2,
      }));
    }

    // map-space → screen-space (with parallax)
    const sx = (x: number) => x * scale + offX + par.x;
    const sy = (y: number) => y * scale + offY + par.y;

    function qpoint(p0: number, c: number, p1: number, tt: number) {
      const u = 1 - tt;
      return u * u * p0 + 2 * u * tt * c + tt * tt * p1;
    }

    function draw() {
      ctx!.clearRect(0, 0, cw, ch);

      // Continents
      ctx!.save();
      ctx!.translate(offX + par.x, offY + par.y);
      ctx!.scale(scale, scale);
      ctx!.fillStyle = "rgba(201,162,39,0.05)";
      ctx!.strokeStyle = "rgba(201,162,39,0.16)";
      ctx!.lineWidth = 0.8 / scale;
      for (const p of paths) { ctx!.fill(p); ctx!.stroke(p); }
      ctx!.restore();

      // Arcs + travelling signals
      for (let i = 0; i < TARGETS.length; i++) {
        const tg = TARGETS[i];
        const cx = (ORIGIN.x + tg.x) / 2;
        const cy = (ORIGIN.y + tg.y) / 2 - 70;

        // faint arc
        ctx!.beginPath();
        ctx!.moveTo(sx(ORIGIN.x), sy(ORIGIN.y));
        ctx!.quadraticCurveTo(sx(cx), sy(cy), sx(tg.x), sy(tg.y));
        ctx!.strokeStyle = "rgba(201,162,39,0.18)";
        ctx!.lineWidth = 1;
        ctx!.stroke();

        // travelling pulse (with short comet trail)
        const phase = (t * 0.0016 + i / TARGETS.length) % 1;
        for (let k = 0; k < 6; k++) {
          const tt = phase - k * 0.025;
          if (tt < 0 || tt > 1) continue;
          const px = sx(qpoint(ORIGIN.x, cx, tg.x, tt));
          const py = sy(qpoint(ORIGIN.y, cy, tg.y, tt));
          ctx!.beginPath();
          ctx!.arc(px, py, 2.2 - k * 0.3, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(231,208,138,${0.9 - k * 0.14})`;
          ctx!.fill();
        }

        // destination node
        ctx!.beginPath();
        ctx!.arc(sx(tg.x), sy(tg.y), 2.4, 0, Math.PI * 2);
        ctx!.fillStyle = "rgba(201,162,39,0.85)";
        ctx!.fill();
      }

      // Origin (India) pulsing glow
      const pulse = (Math.sin(t * 0.04) + 1) / 2;
      const ox = sx(ORIGIN.x), oy = sy(ORIGIN.y);
      const grad = ctx!.createRadialGradient(ox, oy, 0, ox, oy, 26 + pulse * 10);
      grad.addColorStop(0, "rgba(201,162,39,0.5)");
      grad.addColorStop(1, "rgba(201,162,39,0)");
      ctx!.fillStyle = grad;
      ctx!.beginPath(); ctx!.arc(ox, oy, 26 + pulse * 10, 0, Math.PI * 2); ctx!.fill();
      ctx!.beginPath(); ctx!.arc(ox, oy, 3.4, 0, Math.PI * 2);
      ctx!.fillStyle = "#C9A227"; ctx!.fill();

      // Sound particles
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(231,208,138,${p.a})`;
        ctx!.fill();
      }
    }

    function step() {
      t += 1;
      par.x += (par.tx - par.x) * 0.05;
      par.y += (par.ty - par.y) * 0.05;
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = cw; if (p.x > cw) p.x = 0;
        if (p.y < 0) p.y = ch; if (p.y > ch) p.y = 0;
      }
      draw();
      if (running) raf = requestAnimationFrame(step);
    }

    function onMove(e: PointerEvent) {
      if (!fine) return;
      const rect = canvas!.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      par.tx = -nx * 26; par.ty = -ny * 18;
    }

    layout();
    if (reduced) draw();
    else raf = requestAnimationFrame(step);

    const ro = new ResizeObserver(layout);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });

    const io = new IntersectionObserver((entries) => {
      const vis = entries[0]?.isIntersecting ?? true;
      if (reduced) return;
      if (vis && !running) { running = true; raf = requestAnimationFrame(step); }
      else if (!vis && running) { running = false; cancelAnimationFrame(raf); }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
