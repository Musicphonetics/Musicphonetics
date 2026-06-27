import { Hero } from "@/components/sections/Hero";
import { WhatWeDo } from "@/components/sections/WhatWeDo";
import { WhatMakesDifferent } from "@/components/sections/WhatMakesDifferent";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { HowWeDoIt } from "@/components/sections/HowWeDoIt";
import { MoreThanLessons } from "@/components/sections/MoreThanLessons";
import { TrustAndStandards } from "@/components/sections/TrustAndStandards";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { SeoContent } from "@/components/sections/SeoContent";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd, reviewsJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd(), reviewsJsonLd()]} />
      {/* Music classes are the product — trust is the proof */}
      <Hero />
      <WhatWeDo />
      <WhatMakesDifferent />
      <FounderFeature />
      <HowWeDoIt />
      <MoreThanLessons />
      <TrustAndStandards />
      <ReviewsShowcase />
      {/* SEO / AI-readable content + FAQ schema */}
      <SeoContent />
      <FAQ />
      <FinalCTA
        headline="Start your music journey with Musicphonetics."
        text="Tell us what you're looking for and we'll guide you to the right teacher and path."
      />
    </>
  );
}
