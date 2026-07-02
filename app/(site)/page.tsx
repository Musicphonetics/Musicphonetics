import { HeroConcierge } from "@/components/sections/HeroConcierge";
import { ProofBand } from "@/components/sections/ProofBand";
import { MobileTabs } from "@/components/sections/MobileTabs";
import { HowWeDoIt } from "@/components/sections/HowWeDoIt";
import { SystemFlow } from "@/components/sections/SystemFlow";
import { CurriculumTeaser } from "@/components/sections/CurriculumTeaser";
import { ProgramsInteractive } from "@/components/sections/ProgramsInteractive";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { SafetyFirst } from "@/components/sections/SafetyFirst";
import { FacultySelection } from "@/components/sections/FacultySelection";
import { FacultyProfiles } from "@/components/sections/FacultyProfiles";
import { TrustAndStandards } from "@/components/sections/TrustAndStandards";
import { SeeUsInAction } from "@/components/sections/SeeUsInAction";
import { LifeAtMusicphonetics } from "@/components/sections/LifeAtMusicphonetics";
import { StudentGallery } from "@/components/sections/StudentGallery";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { GoogleBusiness } from "@/components/sections/GoogleBusiness";
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
      <ProofBand />            {/* At a glance — real quantities, counted up */}
      <MobileTabs />
      <HowWeDoIt />            {/* How does Musicphonetics work? */}
      <SystemFlow />           {/* The method as a visible system */}
      <CurriculumTeaser />     {/* A clear path → /curriculum */}
      <ProgramsInteractive />  {/* What can I learn? */}
      <FounderFeature />       {/* Why does Musicphonetics exist? */}
      <SafetyFirst />          {/* A stranger never enters your home — child safety */}
      <FacultySelection />     {/* Who will teach me? — rigour, not faces */}
      <FacultyProfiles />      {/* Real teachers — renders nothing until added */}
      <TrustAndStandards />    {/* Recognition & features — real photography */}
      <SeeUsInAction />        {/* See us in action — performances */}
      <LifeAtMusicphonetics /> {/* Life at Musicphonetics — student moments */}
      <StudentGallery />       {/* Inside our lessons — renders nothing until added */}
      <ReviewsShowcase />      {/* What do families say? */}
      <GoogleBusiness />       {/* Independent proof — renders once GBP is set */}
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
