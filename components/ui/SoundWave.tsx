import { cn } from "@/lib/utils";

/**
 * Calm, premium soundwave backdrop — a few thin frequency lines that drift
 * slowly. No particles, no maps. Purely decorative; static under reduced-motion.
 */
export function SoundWave({ className }: { className?: string }) {
  const wave =
    "M0 60 C 120 20, 240 100, 360 60 S 600 20, 720 60 S 960 100, 1080 60 S 1320 20, 1440 60";
  return (
    <div aria-hidden="true" className={cn("pointer-events-none overflow-hidden", className)}>
      <svg
        viewBox="0 0 1440 120"
        preserveAspectRatio="none"
        className="h-full w-full"
        fill="none"
      >
        <g className="mp-wave mp-wave-1" stroke="rgba(201,162,39,0.22)" strokeWidth="1">
          <path d={wave} />
          <path d={wave} transform="translate(1440 0)" />
        </g>
        <g className="mp-wave mp-wave-2" stroke="rgba(201,162,39,0.12)" strokeWidth="1">
          <path d={wave} transform="translate(0 18)" />
          <path d={wave} transform="translate(1440 18)" />
        </g>
        <g className="mp-wave mp-wave-3" stroke="rgba(127,181,155,0.12)" strokeWidth="1">
          <path d={wave} transform="translate(0 -16)" />
          <path d={wave} transform="translate(1440 -16)" />
        </g>
      </svg>
    </div>
  );
}
