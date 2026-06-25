"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  a: number;
}
interface Note {
  x: number;
  y: number;
  vy: number;
  glyph: string;
  size: number;
  a: number;
}

const GLYPHS = ["♪", "♫", "♬", "♩"]; // ♪ ♫ ♬ ♩

/**
 * Living musical environment for the hero:
 * traveling gold waveforms, faint staff lines, drifting glowing notes, and
 * cursor-reactive golden particles. Performant canvas (capped, DPR-aware,
 * pauses off-screen). Renders a single static frame under reduced-motion.
 */
export function MusicScene({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let particles: Particle[] = [];
    let notes: Note[] = [];
    let t = 0;
    let raf = 0;
    let running = true;
    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const pCount = Math.min(46, Math.max(18, Math.round((width * height) / 24000)));
      particles = Array.from({ length: pCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: Math.random() * 1.6 + 0.6,
        a: Math.random() * 0.5 + 0.2,
      }));

      const nCount = Math.min(12, Math.max(5, Math.round(width / 130)));
      notes = Array.from({ length: nCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vy: Math.random() * 0.25 + 0.1,
        glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
        size: Math.random() * 14 + 12,
        a: Math.random() * 0.18 + 0.06,
      }));
    }

    function drawWave(amp: number, freq: number, phase: number, yBase: number, op: number) {
      ctx!.beginPath();
      for (let x = 0; x <= width; x += 6) {
        const y =
          yBase +
          Math.sin(x * freq + phase) * amp +
          Math.sin(x * freq * 0.5 + phase * 1.3) * amp * 0.4;
        if (x === 0) ctx!.moveTo(x, y);
        else ctx!.lineTo(x, y);
      }
      ctx!.strokeStyle = `rgba(201,162,39,${op})`;
      ctx!.lineWidth = 1.4;
      ctx!.stroke();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Faint staff lines
      ctx!.strokeStyle = "rgba(246,244,239,0.05)";
      ctx!.lineWidth = 1;
      const mid = height * 0.5;
      for (let i = -2; i <= 2; i++) {
        const y = mid + i * 16;
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(width, y);
        ctx!.stroke();
      }

      // Traveling waveforms
      drawWave(26, 0.012, t * 0.018, height * 0.5, 0.22);
      drawWave(40, 0.008, -t * 0.012 + 1.5, height * 0.5, 0.14);
      drawWave(16, 0.02, t * 0.025 + 3, height * 0.62, 0.1);

      // Drifting notes
      for (const n of notes) {
        ctx!.font = `${n.size}px serif`;
        ctx!.fillStyle = `rgba(201,162,39,${n.a})`;
        ctx!.fillText(n.glyph, n.x, n.y);
      }

      // Particles + cursor glow
      for (const p of particles) {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        const near = d < 130;
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, near ? p.r * 1.8 : p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(231,208,138,${near ? Math.min(0.9, p.a + 0.4) : p.a})`;
        ctx!.fill();
      }
    }

    function step() {
      t += 1;
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const d = Math.hypot(dx, dy);
        if (d < 130 && d > 0.1) {
          p.x += (dx / d) * 0.5;
          p.y += (dy / d) * 0.5;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;
      }
      for (const n of notes) {
        n.y -= n.vy;
        if (n.y < -20) {
          n.y = height + 20;
          n.x = Math.random() * width;
        }
      }
      draw();
      if (running) raf = requestAnimationFrame(step);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    if (reduced) draw();
    else raf = requestAnimationFrame(step);

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove, { passive: true });
    canvas.addEventListener("pointerleave", onLeave);

    const io = new IntersectionObserver((entries) => {
      const visible = entries[0]?.isIntersecting ?? true;
      if (reduced) return;
      if (visible && !running) {
        running = true;
        raf = requestAnimationFrame(step);
      } else if (!visible && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
