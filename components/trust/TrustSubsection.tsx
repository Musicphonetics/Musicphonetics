import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { cn } from "@/lib/utils";

export function TrustSubsection({
  id,
  eyebrow,
  title,
  intro,
  children,
  blueprint = false,
  className,
}: {
  id?: string;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
  blueprint?: boolean;
  className?: string;
}) {
  return (
    <section id={id} className={cn("relative overflow-hidden border-t border-white/5 py-20 sm:py-24", className)}>
      {blueprint && (
        <div aria-hidden="true" className="mp-blueprint pointer-events-none absolute inset-0 opacity-60" />
      )}
      <div className="container-mp relative">
        <Reveal>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-paper sm:text-4xl">
            {title}
          </h2>
          {intro && (
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-paper/65 sm:text-lg">{intro}</p>
          )}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  );
}
