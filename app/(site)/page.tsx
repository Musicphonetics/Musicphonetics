import { Hero } from "@/components/sections/Hero";
import { NumbersStory } from "@/components/sections/NumbersStory";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { BrandPhilosophy } from "@/components/sections/BrandPhilosophy";
import { FounderSection } from "@/components/sections/FounderSection";
import { WhyUs } from "@/components/sections/WhyUs";
import { MethodPreview } from "@/components/sections/MethodPreview";
import { MusicJourney } from "@/components/sections/MusicJourney";
import { Compounding } from "@/components/sections/Compounding";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Programs } from "@/components/sections/Programs";
import { Reviews } from "@/components/sections/Reviews";
import { Plans } from "@/components/sections/Plans";
import { TeacherPipeline } from "@/components/sections/TeacherPipeline";
import { GlobalVision } from "@/components/sections/GlobalVision";
import { FutureArchitecture } from "@/components/sections/FutureArchitecture";
import { Gallery } from "@/components/sections/Gallery";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd } from "@/lib/seo";

export default function HomePage() {
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd()]} />
      {/* Trailer hero → immediate music + ambition */}
      <Hero />
      <NumbersStory />
      {/* Scale, up front */}
      <Ecosystem />
      <BrandPhilosophy />
      {/* The people + belief */}
      <FounderSection />
      <WhyUs />
      <MethodPreview />
      {/* The emotional learning story */}
      <MusicJourney />
      <Compounding />
      <HowItWorks />
      {/* What you can do today */}
      <Programs />
      <Reviews limit={6} />
      <Plans />
      {/* Visible trust */}
      <TeacherPipeline />
      {/* Where it's going */}
      <GlobalVision />
      <FutureArchitecture />
      <Gallery />
      <FAQ />
      <FinalCTA />
    </>
  );
}
