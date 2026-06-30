import type { Metadata } from "next";
import { TeachHero } from "@/components/teach/TeachHero";
import { PainCards } from "@/components/teach/PainCards";
import { EarningsCalculator } from "@/components/teach/EarningsCalculator";
import { RosterRamp } from "@/components/teach/RosterRamp";
import { SoloVsFaculty } from "@/components/teach/SoloVsFaculty";
import { WhatWeHandle } from "@/components/teach/WhatWeHandle";
import { YearProjection } from "@/components/teach/YearProjection";
import { GrowthLadder } from "@/components/teach/GrowthLadder";
import { ReferralRewards } from "@/components/teach/ReferralRewards";
import { FounderWord } from "@/components/teach/FounderWord";
import { Selective } from "@/components/teach/Selective";
import { BenefitsFaq } from "@/components/teach/BenefitsFaq";
import { TeachFinalCTA } from "@/components/teach/TeachFinalCTA";
import { FacultyApplication } from "@/components/teach/FacultyApplication";

export const metadata: Metadata = {
  title: "Teach with us — join the faculty",
  description:
    "Join the Musicphonetics faculty. You teach — we bring the students, payments, scheduling, and brand. A 70% per-class share, paid on time. Limited intake.",
  openGraph: {
    title: "Teach with us — join the Musicphonetics faculty",
    description:
      "You teach — we bring the students, payments, scheduling, and brand. 70% per-class share, paid on time. Limited intake.",
  },
};

export default function TeachWithUsPage() {
  return (
    <>
      <TeachHero />
      <PainCards />
      <EarningsCalculator />
      <RosterRamp />
      <SoloVsFaculty />
      <WhatWeHandle />
      <YearProjection />
      <GrowthLadder />
      <ReferralRewards />
      <FounderWord />
      <Selective />
      <BenefitsFaq />
      <FacultyApplication />
      <TeachFinalCTA />
    </>
  );
}
