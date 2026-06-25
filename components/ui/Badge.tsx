import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "gold" | "neutral" | "green" | "muted" | "sample";

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}

const tones: Record<Tone, string> = {
  gold: "bg-gold/15 text-deep-gold border-gold/30",
  neutral: "bg-ink/5 text-ink border-hairline",
  green: "bg-feature-green/10 text-feature-green border-feature-green/25",
  muted: "bg-ink/5 text-ink/60 border-hairline",
  sample: "bg-mist text-ink/70 border-hairline",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
