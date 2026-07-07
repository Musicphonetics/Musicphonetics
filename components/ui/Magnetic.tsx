"use client";

import { useRef, type ReactNode } from "react";

/**
 * Magnetic hover wrapper - child gently follows the cursor on pointer devices.
 * No-op on touch and under reduced-motion (transition handles the spring).
 */
export function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  function handleMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - (rect.left + rect.width / 2);
    const y = e.clientY - (rect.top + rect.height / 2);
    el.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
  }

  function reset() {
    const el = ref.current;
    if (el) el.style.transform = "translate(0px, 0px)";
  }

  return (
    <span
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={reset}
      className={className}
      style={{ display: "inline-block", transition: "transform 0.25s ease-out", willChange: "transform" }}
    >
      {children}
    </span>
  );
}
