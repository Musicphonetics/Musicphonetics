import type { Metadata } from "next";
import { HeroInstitution } from "@/components/home/HeroInstitution";
import { NightPortalShowcase } from "@/components/home/night/NightPortalShowcase";
import { NightOnlinePresence } from "@/components/home/night/NightOnlinePresence";
import { HowItWorks } from "@/components/home/HowItWorks";
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
import { DeckShell } from "@/components/deck/DeckShell";
import { SnapPanel } from "@/components/deck/SnapPanel";
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
      {/* Elite full-page deck: each beat is its own screen, one flick per page,
          with a side dot-rail. Tall panels scroll within themselves so nothing
          is ever cut; fees & reviews flip as carousels inside their panel. */}
      <DeckShell>
        <SnapPanel><HeroInstitution /></SnapPanel>
        <SnapPanel><HowItWorks /></SnapPanel>
        <SnapPanel><FunnelPackages /></SnapPanel>
        <SnapPanel><PracticeCalculator /></SnapPanel>
        <SnapPanel><AchievementsBand /></SnapPanel>
        <SnapPanel><NightPortalShowcase /></SnapPanel>
        <SnapPanel><RealMoments /></SnapPanel>
        <SnapPanel><ReviewsSection files={homeReviews} /></SnapPanel>
        <SnapPanel><NightOnlinePresence /></SnapPanel>
        <SnapPanel><CentreEvents /></SnapPanel>
        <SnapPanel><FounderSection /></SnapPanel>
        <SnapPanel><FounderCredibility /></SnapPanel>
        <SnapPanel><FinalCTA /></SnapPanel>
      </DeckShell>
    </>
  );
}
