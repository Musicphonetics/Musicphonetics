import { cn } from "@/lib/utils";

/**
 * Decorative immersive backdrop for dark, cinematic sections:
 * animated gold/green aurora gradients + subtle floating musical notes.
 * Purely decorative (aria-hidden) and disabled under reduced-motion via CSS.
 */
export function AuroraBackground({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <div className="mp-aurora mp-aurora--gold" />
      <div className="mp-aurora mp-aurora--green" />
      <div className="mp-grain" />
    </div>
  );
}
