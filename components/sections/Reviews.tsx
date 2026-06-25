import { Section, SectionHeading } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { REVIEWS } from "@/lib/data";

interface ReviewsProps {
  /** Show all reviews (reviews page) or a subset (home). */
  limit?: number;
}

export function Reviews({ limit }: ReviewsProps) {
  const items = limit ? REVIEWS.slice(0, limit) : REVIEWS;

  return (
    <Section id="reviews" background="paper" spacing="lg">
      <SectionHeading
        eyebrow="Proof"
        title="What families notice first: structure."
        intro="Sample reviews below. We replace these with verified parent testimonials before final launch — we never present sample text as real."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((review, i) => (
          <Reveal key={i} delay={(i % 3) * 90}>
            <Card className="flex h-full flex-col">
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
                className="text-gold"
              >
                <path
                  d="M10 7H6a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2H5M20 7h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2v2a2 2 0 0 1-2 2h-1"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="mt-4 flex-1 text-base leading-relaxed text-ink/80">
                “{review.quote}”
              </p>
              <div className="mt-5 flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-ink">
                  {review.author}
                </span>
                {review.sample && <Badge tone="sample">Sample</Badge>}
              </div>
            </Card>
          </Reveal>
        ))}
      </div>
      <p className="mt-8 text-sm text-ink/55">
        Note: Replace sample reviews with verified parent testimonials before
        final launch.
      </p>
    </Section>
  );
}
