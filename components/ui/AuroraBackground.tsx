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
      {/* Floating musical notes */}
      <span className="mp-note" style={{ left: "12%", top: "30%", animationDelay: "0s" }}>♪</span>
      <span className="mp-note" style={{ left: "78%", top: "22%", animationDelay: "1.6s" }}>♩</span>
      <span className="mp-note" style={{ left: "60%", top: "68%", animationDelay: "3.1s" }}>♫</span>
      <span className="mp-note" style={{ left: "30%", top: "72%", animationDelay: "4.4s" }}>♬</span>
    </div>
  );
}
