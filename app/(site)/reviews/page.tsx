import type { Metadata } from "next";
import { Reviews } from "@/components/home/Reviews";
import { WhatsAppCTA } from "@/components/home/WhatsAppCTA";
import { REVIEWS, WA_MSG } from "@/lib/home-config";

export const metadata: Metadata = {
  title: "Reviews — Real Google reviews from parents & students | Musicphonetics",
  description:
    "Real Google reviews from Musicphonetics parents and students across Delhi NCR — shown as screenshots exactly as received from Google.",
  openGraph: {
    title: "Real Parents. Real Students. Real Progress. — Musicphonetics reviews",
    description: "Real Google reviews from parents and students across Delhi NCR.",
  },
};

export default function ReviewsPage() {
  return (
    <section className="bg-ink py-16 text-paper sm:py-20">
      <div className="container-mp">
        <p className="eyebrow text-gold">Reviews</p>
        <h1 className="mt-3 max-w-2xl font-display text-4xl font-semibold leading-[1.08] sm:text-5xl">
          Real Parents. Real Students. Real Progress.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-paper/75">
          Real experiences shared through Google reviews — screenshots shown exactly as received from Google.
        </p>

        <div className="mt-10">
          <Reviews files={REVIEWS} variant="grid" />
        </div>

        <p className="mt-6 text-xs text-paper/50">Real Google reviews from parents and students · Screenshots shown as received from Google.</p>

        <div className="mt-9">
          <WhatsAppCTA label="Talk to us on WhatsApp" message={WA_MSG.reviews} />
        </div>
      </div>
    </section>
  );
}
