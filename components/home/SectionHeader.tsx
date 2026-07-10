import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

// The single, repeated section-header motif that ties the whole page together:
// [gold hairline] + [uppercase gold eyebrow] + [Fraunces H2] + optional sub.
// Applied identically to every section so nothing looks ad-hoc.
export function SectionHeader({
  eyebrow, title, sub, invert, center, className,
}: {
  eyebrow: string; title: React.ReactNode; sub?: React.ReactNode;
  invert?: boolean; center?: boolean; className?: string;
}) {
  return (
    <Reveal>
      <div className={cn(center && "text-center", className)}>
        <div className={cn("flex items-center gap-3", center && "justify-center")}>
          <span aria-hidden="true" className="h-px w-10 bg-gold" />
          <span className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-[#7A5E0F]">{eyebrow}</span>
        </div>
        <h2 className={cn(
          "mt-4 font-display font-medium leading-[1.06]",
          "text-[clamp(1.9rem,4vw,3rem)]",
          invert ? "text-paper" : "text-ink",
        )}>
          {title}
        </h2>
        {sub && (
          <p className={cn(
            "mt-4 max-w-xl text-[0.95rem] leading-relaxed sm:text-[1.0625rem]",
            center && "mx-auto",
            invert ? "text-paper/70" : "text-ink/65",
          )}>
            {sub}
          </p>
        )}
      </div>
    </Reveal>
  );
}
