import { Hero } from "@/components/sections/Hero";
import { Mission } from "@/components/sections/Mission";
import { WhatMakesDifferent } from "@/components/sections/WhatMakesDifferent";
import { MusicJourney } from "@/components/sections/MusicJourney";
import { MoreThanLessons } from "@/components/sections/MoreThanLessons";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Community } from "@/components/sections/Community";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { TrustCentre } from "@/components/sections/TrustCentre";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { SeoContent } from "@/components/sections/SeoContent";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd, reviewsJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd(), reviewsJsonLd()]} />
      {/* A story, told in order */}
      <Hero />
      <Mission />
      <WhatMakesDifferent />
      <MusicJourney />
      <MoreThanLessons />
      <Ecosystem />
      <Community />
      <ReviewsShowcase />
      <TrustCentre />
      <FounderFeature />
      {/* SEO / AI-readable content + FAQ schema */}
      <SeoContent />
      <FAQ />
      <FinalCTA />
    </>
  );
}
