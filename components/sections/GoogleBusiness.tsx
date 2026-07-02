import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import { GOOGLE_BUSINESS } from "@/lib/data";

/**
 * "Find us on Google" — a third-party trust signal a cold visitor can verify
 * independently. Renders NOTHING until a Google Business Profile URL is set in
 * GOOGLE_BUSINESS (lib/data.ts) — no placeholder, no fake rating.
 */
export function GoogleBusiness() {
  const { profileUrl, reviewUrl, mapEmbedSrc } = GOOGLE_BUSINESS;
  if (!profileUrl) return null;

  return (
    <Section id="google" background="white" spacing="lg">
      <SectionHeading
        eyebrow="Verified on Google"
        title="Check us for yourself."
        intro="Real, independent reviews on our Google Business Profile — the trust signal you can verify without taking our word for it."
      />
      <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-stretch">
        <Reveal>
          <div className="flex h-full flex-col justify-center rounded-3xl border border-hairline bg-paper p-8">
            <p className="text-sm leading-relaxed text-ink/70">
              See our reviews, photos, and location on Google — and, if we&apos;ve
              taught your family, we&apos;d be grateful for a review.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button href={profileUrl} external variant="primary" size="lg">
                View on Google
              </Button>
              {reviewUrl && (
                <Button href={reviewUrl} external variant="secondary" size="lg">
                  Leave a Google review
                </Button>
              )}
            </div>
          </div>
        </Reveal>
        {mapEmbedSrc && (
          <Reveal delay={120}>
            <div className="overflow-hidden rounded-3xl border border-hairline shadow-card">
              <iframe
                src={mapEmbedSrc}
                title="Musicphonetics on Google Maps"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="h-full min-h-[280px] w-full"
                allowFullScreen
              />
            </div>
          </Reveal>
        )}
      </div>
    </Section>
  );
}
