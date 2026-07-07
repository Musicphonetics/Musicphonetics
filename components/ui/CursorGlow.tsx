"use client";

import { useEffect, useRef } from "react";

/**
 * Soft light that follows the cursor - desktop pointer only, very subtle.
 * Disabled on touch and under reduced-motion. Purely decorative.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const el = ref.current;
    if (!el) return;
    el.style.opacity = "1";

    let raf = 0;
    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    function onMove(e: PointerEvent) {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el!.style.transform = `translate(${pos.x - 250}px, ${pos.y - 250}px)`;
          raf = 0;
        });
      }
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[5] h-[500px] w-[500px] rounded-full opacity-0 transition-opacity duration-700"
      style={{
        background:
          "radial-gradient(circle, rgba(201,162,39,0.10), transparent 60%)",
        mixBlendMode: "multiply",
      }}
    />
  );
}
