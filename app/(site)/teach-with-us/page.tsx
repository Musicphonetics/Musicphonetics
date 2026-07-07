import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { TeachStickyBar } from "@/components/teach/TeachStickyBar";
import { TeachHero } from "@/components/teach/TeachHero";
import { TeachProofStrip } from "@/components/teach/TeachProofStrip";
import { Ecosystem } from "@/components/teach/Ecosystem";
import { EarningsCalculator } from "@/components/teach/EarningsCalculator";
import { ScopeOfWork } from "@/components/teach/ScopeOfWork";
import { GrowthLadder } from "@/components/teach/GrowthLadder";
import { HowPayouts } from "@/components/teach/HowPayouts";
import { NonNegotiable } from "@/components/teach/NonNegotiable";
import { ReferralRewards } from "@/components/teach/ReferralRewards";
import { BenefitsFaq } from "@/components/teach/BenefitsFaq";
import { FacultyApplication } from "@/components/teach/FacultyApplication";
import { TeachFinalCTA } from "@/components/teach/TeachFinalCTA";
import { StaveDivider } from "@/components/teach/StaveDivider";

const SITE = "https://musicphonetics.com";

export const metadata: Metadata = {
  title: "Teach With Musicphonetics - Earn What Your Craft Is Worth",
  description:
    "Music teacher jobs in Delhi NCR and online. Keep 70% of every fee, walk into a ready student network, and be paid on time. Students, payments and scheduling are handled for you.",
  alternates: { canonical: `${SITE}/teach-with-us` },
  openGraph: {
    title: "Teach With Musicphonetics - Earn What Your Craft Is Worth",
    description:
      "Keep 70% of every fee. A ready student network, payments and scheduling handled for you. Music teacher roles across Delhi NCR and online.",
  },
};

const jobPosting = {
  "@context": "https://schema.org",
  "@type": "JobPosting",
  title: "Music Teacher (Faculty) - Guitar, Piano, Vocals, Drums, Violin & more",
  description:
    "Musicphonetics is recruiting music teachers across Delhi NCR and online. You teach one-to-one; we bring the students, handle payments and scheduling, and provide the brand and systems. Teachers keep 70% of every fee, paid on a fixed monthly cycle.",
  datePosted: "2026-07-06",
  employmentType: ["FULL_TIME", "PART_TIME", "CONTRACTOR"],
  industry: "Music Education",
  directApply: true,
  hiringOrganization: {
    "@type": "Organization",
    name: "Musicphonetics",
    sameAs: SITE,
    url: SITE,
  },
  jobLocationType: "TELECOMMUTE",
  applicantLocationRequirements: { "@type": "Country", name: "India" },
  jobLocation: {
    "@type": "Place",
    address: {
      "@type": "PostalAddress",
      addressRegion: "Delhi NCR",
      addressCountry: "IN",
    },
  },
};

const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Musicphonetics",
  url: SITE,
  description:
    "Premium, founder-led, one-to-one music education across Delhi NCR and online. 10+ years, 1,100+ students taught, 200+ Trinity College London graded-exam successes.",
  areaServed: "Delhi NCR",
  knowsAbout: ["Music education", "Trinity College London graded exams", "Guitar", "Piano", "Vocals", "Drums", "Violin"],
};

export default function TeachWithUsPage() {
  return (
    <>
      <JsonLd data={[jobPosting, organization]} />
      <TeachStickyBar />

      <TeachHero />
      <TeachProofStrip />
      <StaveDivider background="paper" />
      <Ecosystem />
      <StaveDivider background="white" />
      <EarningsCalculator />
      <StaveDivider background="paper" />
      <ScopeOfWork />
      <StaveDivider background="white" />
      <GrowthLadder />
      <HowPayouts />
      <NonNegotiable />
      <ReferralRewards />
      <StaveDivider background="paper" />
      <BenefitsFaq />
      <FacultyApplication />
      <TeachFinalCTA />
    </>
  );
}
