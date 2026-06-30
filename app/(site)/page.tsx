import { HeroConcierge } from "@/components/sections/HeroConcierge";
import { ProofStrip } from "@/components/sections/ProofStrip";
import { MobileTabs } from "@/components/sections/MobileTabs";
import { HowWeDoIt } from "@/components/sections/HowWeDoIt";
import { ProgramsInteractive } from "@/components/sections/ProgramsInteractive";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { FacultySelection } from "@/components/sections/FacultySelection";
import { TrustAndStandards } from "@/components/sections/TrustAndStandards";
import { SeeUsInAction } from "@/components/sections/SeeUsInAction";
import { LifeAtMusicphonetics } from "@/components/sections/LifeAtMusicphonetics";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { QuickContact } from "@/components/sections/QuickContact";
import { SeoContent } from "@/components/sections/SeoContent";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd, reviewsJsonLd, instrumentCoursesJsonLd } from "@/lib/seo";

export default function HomePage() {
  // Each section answers one question — no repetition.
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd(), instrumentCoursesJsonLd(), reviewsJsonLd()]} />
      <HeroConcierge />        {/* Who are you? Why continue? */}
      <ProofStrip />           {/* At a glance — real quantities */}
      <MobileTabs />
      <HowWeDoIt />            {/* How does Musicphonetics work? */}
      <ProgramsInteractive />  {/* What can I learn? */}
      <FounderFeature />       {/* Why does Musicphonetics exist? */}
      <FacultySelection />     {/* Who will teach me? — rigour, not faces */}
      <TrustAndStandards />    {/* Recognition & features — real photography */}
      <SeeUsInAction />        {/* See us in action — performances */}
      <LifeAtMusicphonetics /> {/* Life at Musicphonetics — student moments */}
      <ReviewsShowcase />      {/* What do families say? */}
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
