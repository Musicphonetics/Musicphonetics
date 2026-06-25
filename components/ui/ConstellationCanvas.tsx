"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  kind: number; // 0 student, 1 teacher, 2 artist, 3 school
}

const COLORS = ["#C9A227", "#E7D08A", "#7FB59B", "#F6F4EF"];

/**
 * Performant interactive constellation: nodes (students, teachers, artists,
 * schools) drifting and connected by lines, with subtle cursor attraction.
 * - Capped node count, DPR-aware, pauses when off-screen.
 * - Static single frame under prefers-reduced-motion.
 */
export function ConstellationCanvas({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };
    let raf = 0;
    let running = true;

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas!.width = Math.floor(width * dpr);
      canvas!.height = Math.floor(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Scale node count with area, capped for performance.
      const target = Math.min(60, Math.max(22, Math.round((width * height) / 14000)));
      nodes = Array.from({ length: target }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 1.2,
        kind: Math.floor(Math.random() * 4),
      }));
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);

      // Connections
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const op = (1 - dist / 120) * 0.5;
            ctx!.strokeStyle = `rgba(201,162,39,${op})`;
            ctx!.lineWidth = 0.6;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      // Nodes
      for (const n of nodes) {
        ctx!.fillStyle = COLORS[n.kind];
        ctx!.globalAlpha = 0.9;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx!.fill();
      }
      ctx!.globalAlpha = 1;
    }

    function step() {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;

        // Gentle cursor attraction
        const dx = mouse.x - n.x;
        const dy = mouse.y - n.y;
        const d = Math.hypot(dx, dy);
        if (d < 140 && d > 0.1) {
          n.x += (dx / d) * 0.4;
          n.y += (dy / d) * 0.4;
        }

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;
        n.x = Math.max(0, Math.min(width, n.x));
        n.y = Math.max(0, Math.min(height, n.y));
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
    if (reduced) {
      draw(); // single static frame
    } else {
      raf = requestAnimationFrame(step);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    // Pause when scrolled out of view
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

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
    />
  );
}
