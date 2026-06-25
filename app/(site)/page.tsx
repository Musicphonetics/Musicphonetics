import { Hero } from "@/components/sections/Hero";
import { TrustStrip } from "@/components/sections/TrustStrip";
import { FounderSection } from "@/components/sections/FounderSection";
import { WhyUs } from "@/components/sections/WhyUs";
import { MethodPreview } from "@/components/sections/MethodPreview";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Programs } from "@/components/sections/Programs";
import { Reviews } from "@/components/sections/Reviews";
import { Plans } from "@/components/sections/Plans";
import { Gallery } from "@/components/sections/Gallery";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";

export default function HomePage() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <FounderSection />
      <WhyUs />
      <MethodPreview />
      <HowItWorks />
      <Programs />
      <Reviews limit={6} />
      <Plans />
      <Gallery />
      <FAQ />
      <FinalCTA />
    </>
  );
}
