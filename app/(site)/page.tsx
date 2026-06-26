import { Hero } from "@/components/sections/Hero";
import { TrustNumbers } from "@/components/sections/TrustNumbers";
import { Problem } from "@/components/sections/Problem";
import { TransformationPath } from "@/components/sections/TransformationPath";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { Roadmap } from "@/components/sections/Roadmap";
import { ProgramsGrid } from "@/components/sections/ProgramsGrid";
import { ParentConfidence } from "@/components/sections/ParentConfidence";
import { TeacherPipeline } from "@/components/sections/TeacherPipeline";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";
import { BrandArchitecture } from "@/components/sections/BrandArchitecture";
import { ExamPathway } from "@/components/sections/ExamPathway";
import { SeoContent } from "@/components/sections/SeoContent";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd()]} />
      {/* 1 — cinematic India→global hero */}
      <Hero />
      {/* 2 — trust numbers */}
      <TrustNumbers />
      {/* 3 — the problem */}
      <Problem />
      {/* 4 — the Musicphonetics way */}
      <TransformationPath />
      {/* 5 — founder */}
      <FounderFeature />
      {/* 6 — India to world roadmap */}
      <Roadmap />
      {/* 7 — programs */}
      <ProgramsGrid />
      {/* 8 — parent confidence */}
      <ParentConfidence />
      {/* visible trust — teacher quality */}
      <TeacherPipeline />
      {/* 9 — reviews */}
      <ReviewsShowcase />
      {/* 10 — brand architecture */}
      <BrandArchitecture />
      {/* 11 — exam pathways */}
      <ExamPathway />
      {/* 12 — SEO/GEO content + FAQ */}
      <SeoContent />
      <FAQ />
      {/* 13 — final CTA */}
      <FinalCTA />
    </>
  );
}
