import type { Metadata } from "next";
import { NightHero } from "@/components/home/night/NightHero";
import { NightTrustStrip } from "@/components/home/night/NightTrustStrip";
import { NightFoundation } from "@/components/home/night/NightFoundation";
import { NightReviewsTeaser } from "@/components/home/night/NightReviewsTeaser";
import { NightPortalShowcase } from "@/components/home/night/NightPortalShowcase";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FunnelPackages } from "@/components/home/FunnelPackages";
import { RealMoments } from "@/components/home/RealMoments";
import { ReviewsSection } from "@/components/home/Reviews";
import { CentreEvents } from "@/components/home/CentreEvents";
import { FounderSection } from "@/components/home/FounderSection";
import { FinalCTA } from "@/components/home/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { REVIEWS, HOME_REVIEW_COUNT } from "@/lib/home-config";

const SITE = "https://musicphonetics.com";

export const metadata: Metadata = {
  title: "Music education, built like an institution | Musicphonetics",
  description:
    "A structured, one-to-one music school in Delhi NCR and online - a matched teacher, a real curriculum, tracked progress, and a stage to perform on. Guitar, piano/keyboard & vocals. Book a free trial on WhatsApp.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Music education, built like an institution - Musicphonetics",
    description:
      "A structured, one-to-one music school. Matched teacher, real curriculum, tracked progress, a stage to perform on. Delhi NCR + Online.",
    type: "website",
    siteName: "Musicphonetics",
    locale: "en_IN",
  },
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Musicphonetics",
  description:
    "A structured, one-to-one music school - guitar, piano/keyboard and vocal classes for children, beginners and serious learners, at home and online across Delhi NCR.",
  url: SITE,
  areaServed: "Delhi NCR",
  knowsAbout: ["Guitar classes", "Piano classes", "Keyboard classes", "Vocal classes", "Music theory", "Trinity music exam preparation"],
  address: { "@type": "PostalAddress", addressRegion: "Delhi NCR", addressCountry: "IN" },
  makesOffer: [
    { "@type": "Offer", name: "Foundation" },
    { "@type": "Offer", name: "The Main Pathway" },
  ],
};

export default function HomePage() {
  const homeReviews = REVIEWS.slice(0, HOME_REVIEW_COUNT);
  return (
    <>
      <JsonLd data={localBusiness} />
      {/* Dark, cinematic mobile-first flow: hero + portal → why us → the journey →
          proof → how it works → the paths → real moments → reviews → place → founder → act. */}
      <NightHero />
      <NightTrustStrip />
      <HowItWorks />
      <FunnelPackages />
      <NightFoundation />
      <NightPortalShowcase />
      <RealMoments />
      <NightReviewsTeaser />
      <ReviewsSection files={homeReviews} />
      <CentreEvents />
      <FounderSection />
      <FinalCTA />
    </>
  );
}
