import { HeroConcierge } from "@/components/sections/HeroConcierge";
import { MobileTabs } from "@/components/sections/MobileTabs";
import { ProgramsInteractive } from "@/components/sections/ProgramsInteractive";
import { Stories } from "@/components/sections/Stories";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { MoreThanLessons } from "@/components/sections/MoreThanLessons";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { HowWeDoIt } from "@/components/sections/HowWeDoIt";
import { TrustAndStandards } from "@/components/sections/TrustAndStandards";
import { Partners } from "@/components/sections/Partners";
import { QuickContact } from "@/components/sections/QuickContact";
import { SeoContent } from "@/components/sections/SeoContent";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd, reviewsJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd(), reviewsJsonLd()]} />
      {/* One question. One purpose. The instrument selector starts the journey. */}
      <HeroConcierge />
      <MobileTabs />

      {/* Trust + product, building the decision below the fold */}
      <ProgramsInteractive />
      <Stories />
      <ReviewsShowcase />
      <MoreThanLessons />
      <FounderFeature />
      <HowWeDoIt />
      <TrustAndStandards />
      <Partners />
      {/* Relocated contact actions — supporting, not competing with, the hero */}
      <QuickContact />
      <SeoContent />
      <FAQ />
      <FinalCTA
        headline="Start your music journey with Musicphonetics."
        text="Tell us what you're looking for and we'll guide you to the right teacher and path."
      />
    </>
  );
}
