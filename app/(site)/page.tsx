import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { BrandPhilosophy } from "@/components/sections/BrandPhilosophy";
import { FounderSection } from "@/components/sections/FounderSection";
import { WhyUs } from "@/components/sections/WhyUs";
import { MethodPreview } from "@/components/sections/MethodPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Programs } from "@/components/sections/Programs";
import { GlobalVision } from "@/components/sections/GlobalVision";
import { Reviews } from "@/components/sections/Reviews";
import { Plans } from "@/components/sections/Plans";
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
      {/* 1. Identity, trust, ambition — and the ecosystem — up front */}
      <Hero />
      <TrustStrip />
      <Ecosystem />
      <BrandPhilosophy />
      {/* 2. Trust & the people behind it */}
      <FounderSection />
      <WhyUs />
      <MethodPreview />
      <HowItWorks />
      {/* 3. What you can do today */}
      <Programs />
      <Reviews limit={6} />
      <Plans />
      {/* 4. Where it's going */}
      <GlobalVision />
      <FutureArchitecture />
      <Gallery />
      <FAQ />
      <FinalCTA />
    </>
  );
}
