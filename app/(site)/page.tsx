import { MobileHero } from "@/components/sections/MobileHero";
import { Hero } from "@/components/sections/Hero";
import { MobileTabs } from "@/components/sections/MobileTabs";
import { Classes } from "@/components/sections/Classes";
import { Stories } from "@/components/sections/Stories";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { MoreThanLessons } from "@/components/sections/MoreThanLessons";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { HowWeDoIt } from "@/components/sections/HowWeDoIt";
import { TrustAndStandards } from "@/components/sections/TrustAndStandards";
import { Partners } from "@/components/sections/Partners";
import { SeoContent } from "@/components/sections/SeoContent";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd, reviewsJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd(), reviewsJsonLd()]} />
      {/* Overview — dense listing on mobile, cinematic on desktop */}
      <div id="overview">
        <MobileHero />
        <Hero />
      </div>
      <MobileTabs />

      {/* Classes are the product */}
      <Classes />
      {/* Stories keep people engaged */}
      <Stories />
      {/* Reviews early, near the top */}
      <ReviewsShowcase />
      {/* Why it matters to a parent */}
      <MoreThanLessons />
      <FounderFeature />
      <HowWeDoIt />
      {/* Standards as a trust strip only */}
      <TrustAndStandards />
      {/* Partner ecosystem */}
      <Partners />
      {/* SEO / AI + FAQ */}
      <SeoContent />
      <FAQ />
      <FinalCTA
        headline="Start your music journey with Musicphonetics."
        text="Tell us what you're looking for and we'll guide you to the right teacher and path."
      />
    </>
  );
}
