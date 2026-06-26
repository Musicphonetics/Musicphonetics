import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { REVIEWS } from "@/lib/data";
import { cn } from "@/lib/utils";

export function ReviewsShowcase() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <AuroraBackground />
      <div className="container-mp relative">
        <SectionHeading
          eyebrow="Loved by parents"
          title="Verified parent reviews."
          intro="Written reviews shown today. Video reviews coming soon."
          invert
        />

        <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5 [&>*]:break-inside-avoid">
          {REVIEWS.map((r, i) => (
            <Reveal key={i} delay={(i % 3) * 90}>
              <figure
                className={cn(
                  "mp-glass rounded-2xl p-5 shadow-card-hover",
                  i % 2 === 0 ? "mp-float" : ""
                )}
                style={{ animationDelay: `${i * 400}ms` }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm tracking-tight text-gold" aria-label="5 out of 5 stars">
                    ★★★★★
                  </span>
                  <span className="mp-stamp inline-flex items-center gap-1 rounded-full bg-feature-green/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Verified
                  </span>
                </div>
                <blockquote className="mt-3 text-[0.95rem] leading-relaxed text-paper/90">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-3 text-xs text-paper/55">
                  — {r.author}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
