import type { Metadata } from "next";
import { FunnelHero } from "@/components/home/FunnelHero";
import { StatsBand } from "@/components/home/StatsBand";
import { WhyTrust } from "@/components/home/WhyTrust";
import { FunnelPackages } from "@/components/home/FunnelPackages";
import { ReviewsSection } from "@/components/home/Reviews";
import { AfterYouJoin } from "@/components/home/AfterYouJoin";
import { FounderMission } from "@/components/home/FounderMission";
import { GoldDivider } from "@/components/home/GoldDivider";
import { JsonLd } from "@/components/seo/JsonLd";
import { REVIEWS, HOME_REVIEW_COUNT } from "@/lib/home-config";

const SITE = "https://musicphonetics.com";

export const metadata: Metadata = {
  title: "Music Classes in Delhi NCR & Online — Guitar, Piano, Vocals | Musicphonetics",
  description:
    "Structured music learning for children, beginners & serious learners — guitar, piano/keyboard & vocal classes at home and online across Delhi NCR. Teacher matching, progress tracking, Trinity exam preparation where applicable. Enquire on WhatsApp.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Music classes that don't feel random — Musicphonetics",
    description:
      "Structured music learning — guitar, piano/keyboard & vocals. Delhi NCR + Online. Teacher matching and progress tracking. Enquire on WhatsApp.",
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
    "Structured music education — guitar, piano/keyboard and vocal classes for children, beginners and serious learners, at home and online across Delhi NCR.",
  url: SITE,
  areaServed: "Delhi NCR",
  knowsAbout: ["Guitar classes", "Piano classes", "Keyboard classes", "Vocal classes", "Music theory", "Trinity music exam preparation"],
  address: { "@type": "PostalAddress", addressRegion: "Delhi NCR", addressCountry: "IN" },
  makesOffer: [
    { "@type": "Offer", name: "Foundation", price: "8000", priceCurrency: "INR" },
    { "@type": "Offer", name: "Main Musicphonetics Pathway", price: "12000", priceCurrency: "INR" },
  ],
};

export default function HomePage() {
  const homeReviews = REVIEWS.slice(0, HOME_REVIEW_COUNT);
  return (
    <>
      <JsonLd data={localBusiness} />
      <FunnelHero />
      <StatsBand />
      <WhyTrust />
      <GoldDivider />
      <FunnelPackages />
      <GoldDivider />
      <ReviewsSection files={homeReviews} />
      <GoldDivider />
      <AfterYouJoin />
      <GoldDivider />
      <FounderMission />
    </>
  );
}
