import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { REVIEWS } from "@/lib/data";

const RANKS = ["Lt Col", "Col", "Brigadier", "Major General"];
// Three premium-locality reviews (each quote appears once on the homepage).
const PICKS = ["Priya Sharma", "Rajesh Verma", "Neha Kapoor"]
  .map((n) => REVIEWS.find((r) => r.name === n))
  .filter(Boolean) as typeof REVIEWS;

export function ReviewsCompact() {
  return (
    <Section id="reviews" background="paper" spacing="lg">
      <Reveal>
        <div className="max-w-2xl">
          <p className="eyebrow">Trusted families</p>
          <h2 className="mt-3 font-display text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Trusted across Delhi NCR - by defence officers and discerning families.
          </h2>
        </div>
      </Reveal>

      {/* Defence rank badges */}
      <Reveal delay={80}>
        <div className="mt-7 flex flex-wrap items-center gap-2.5">
          <span className="text-sm font-medium text-ink/60">Delhi Cantonment:</span>
          {RANKS.map((r) => (
            <span key={r} className="rounded-lg border border-gold/40 bg-gold/5 px-3 py-1.5 font-display text-sm font-semibold text-ink">
              {r}
            </span>
          ))}
        </div>
      </Reveal>

      {/* Premium-locality reviews */}
      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        {PICKS.map((r, i) => (
          <Reveal key={r.name} delay={(i % 3) * 80}>
            <figure className="flex h-full flex-col rounded-3xl border border-hairline bg-white p-6 shadow-card">
              <div className="text-gold" aria-label="5 out of 5 stars" role="img">★★★★★</div>
              <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink/80">
                “{r.quote}”
              </blockquote>
              <figcaption className="mt-4 border-t border-hairline pt-3 text-sm">
                <span className="font-display font-semibold text-ink">{r.name}</span>
                <span className="text-ink/30"> · </span>
                <span className="text-ink/60">{r.area}</span>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>

      <Reveal>
        <div className="mt-8">
          <Button href="/reviews" variant="secondary" size="lg">Read all reviews</Button>
        </div>
      </Reveal>
    </Section>
  );
}
