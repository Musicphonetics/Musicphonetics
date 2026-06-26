import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { Reveal } from "@/components/ui/Reveal";
import { REVIEWS } from "@/lib/data";

// Split "Ritu, Gurgaon" → { name: "Ritu", city: "Gurgaon" } (real data only).
function parse(author: string): { name: string; city: string } {
  const idx = author.lastIndexOf(",");
  if (idx === -1) return { name: author, city: "" };
  return { name: author.slice(0, idx).trim(), city: author.slice(idx + 1).trim() };
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const TRUST_INDICATORS = [
  "Verified Parent Reviews",
  "Screenshot Verification Available",
  "Video Testimonials Coming Soon",
  "Every review collected after real classes",
];

export function ReviewsShowcase() {
  return (
    <section className="relative overflow-hidden bg-ink py-20 text-paper sm:py-28">
      <AuroraBackground />
      <div className="container-mp relative">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Loved by families</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight text-paper sm:text-4xl">
              Trusted by families. Proven through experience.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-paper/70 sm:text-lg">
              Every review below comes from a real Musicphonetics family. Video
              testimonials and additional verified reviews will be added over
              time.
            </p>
          </div>
        </Reveal>

        {/* Trust indicators */}
        <Reveal>
          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {TRUST_INDICATORS.map((t) => (
              <li key={t} className="flex items-center gap-2 text-sm text-paper/75">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-emerald-400/15 text-emerald-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </Reveal>

        {/* Cards — swipe on mobile, grid on desktop */}
        <div className="mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-3 [scrollbar-width:thin]">
          {REVIEWS.map((r, i) => {
            const { name, city } = parse(r.author);
            return (
              <Reveal key={i} delay={(i % 3) * 80}>
                <figure className="group mp-glass flex h-full w-[84vw] shrink-0 snap-center flex-col rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-gold/40 sm:w-auto sm:shrink">
                  <div className="flex items-center gap-3">
                    {/* Profile placeholder */}
                    <span className="grid h-11 w-11 place-items-center rounded-full border border-gold/30 bg-gold/10 font-display text-sm font-semibold text-gold">
                      {initials(name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-paper">{name}</p>
                      {city && <p className="text-xs text-paper/55">{city}</p>}
                    </div>
                    {/* Verified badge — glows softly on hover */}
                    <span className="inline-flex items-center gap-1 rounded-full bg-feature-green/25 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-300 shadow-[0_0_0_rgba(16,185,129,0)] transition-shadow duration-300 group-hover:shadow-[0_0_14px_rgba(16,185,129,0.45)]">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Verified
                    </span>
                  </div>

                  <div className="mt-4 text-sm tracking-tight text-gold" aria-label="5 out of 5 stars">★★★★★</div>

                  <blockquote className="mt-3 flex-1 text-[0.97rem] leading-relaxed text-paper/90">
                    “{r.quote}”
                  </blockquote>

                  {/* Optional video button — hidden until videos are uploaded.
                      TODO(content): render when a review has a `video` URL. */}
                </figure>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
