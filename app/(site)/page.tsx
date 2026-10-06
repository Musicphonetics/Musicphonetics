import type { Metadata } from "next";
import { VisionHero } from "@/components/home/vision/VisionHero";
import { LearningLoop } from "@/components/home/vision/LearningLoop";
import { InfrastructureLayers } from "@/components/home/vision/InfrastructureLayers";
import { MeasureAndBuild } from "@/components/home/vision/MeasureAndBuild";
import { PortalShowcase } from "@/components/home/portal/PortalShowcase";
import { NightOnlinePresence } from "@/components/home/night/NightOnlinePresence";
import { FunnelPackages } from "@/components/home/FunnelPackages";
import { PracticeCalculator } from "@/components/home/PracticeCalculator";
import { AchievementsBand } from "@/components/home/AchievementsBand";
import { RealMoments } from "@/components/home/RealMoments";
import { ReviewsSection } from "@/components/home/Reviews";
import { CentreEvents } from "@/components/home/CentreEvents";
import { FounderSection } from "@/components/home/FounderSection";
import { FounderCredibility } from "@/components/home/FounderCredibility";
import { FinalCTA } from "@/components/home/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { REVIEWS, HOME_REVIEW_COUNT } from "@/lib/home-config";

const SITE = "https://musicphonetics.com";

export const metadata: Metadata = {
  title: "Musicphonetics — the technology behind how music is learned",
  description:
    "A premium one-to-one music school in Delhi NCR and online, built on real technology: live teacher and parent portals, structured student records and assessment, and an intelligence layer being built around every lesson, practice and performance. Book a free trial.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Musicphonetics — the technology behind how music is learned",
    description:
      "A music school with a real platform underneath — teacher & parent portals, student records, assessment data — and an intelligence layer being built around music education. Delhi NCR + Online + building globally.",
    type: "website",
    siteName: "Musicphonetics",
    locale: "en_IN",
  },
};

const org = {
  "@context": "https://schema.org",
  "@type": ["EducationalOrganization", "LocalBusiness"],
  name: "Musicphonetics",
  description:
    "A technology-enabled music education company: a structured one-to-one music school with live teacher, parent and owner platforms, student records and assessment, building an intelligence layer around how music is learned.",
  url: SITE,
  areaServed: "Delhi NCR",
  knowsAbout: ["Guitar classes", "Piano classes", "Keyboard classes", "Vocal classes", "Music theory", "Music education technology", "Learning assessment", "Trinity music exam preparation"],
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
      <JsonLd data={org} />

      {/* ── The vision: the first three scrolls reframe what Musicphonetics is ── */}
      <VisionHero />
      <LearningLoop />
      <InfrastructureLayers />

      {/* ── The evidence: the platform layer, already live ── */}
      <PortalShowcase />
      <MeasureAndBuild />

      {/* ── The real foundation: a working music school people already trust ── */}
      <FunnelPackages />
      <AchievementsBand />
      <RealMoments />
      <ReviewsSection files={homeReviews} />
      <PracticeCalculator />
      <NightOnlinePresence />
      <CentreEvents />
      <FounderSection />
      <FounderCredibility />
      <FinalCTA />
    </>
  );
}
