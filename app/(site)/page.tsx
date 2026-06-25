import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { BrandPhilosophy } from "@/components/sections/BrandPhilosophy";
import { FounderSection } from "@/components/sections/FounderSection";
import { WhyUs } from "@/components/sections/WhyUs";
import { MethodPreview } from "@/components/sections/MethodPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Programs } from "@/components/sections/Programs";
import { Ecosystem } from "@/components/sections/Ecosystem";
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
      <Hero />
      <TrustStrip />
      <BrandPhilosophy />
      <FounderSection />
      <WhyUs />
      <MethodPreview />
      <HowItWorks />
      <Programs />
      <Ecosystem />
      <Reviews limit={6} />
      <Plans />
      <GlobalVision />
      <FutureArchitecture />
      <Gallery />
      <FAQ />
      <FinalCTA />
    </>
  );
}
