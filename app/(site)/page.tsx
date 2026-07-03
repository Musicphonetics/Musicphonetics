import { HeroConcierge } from "@/components/sections/HeroConcierge";
import { FounderFeature } from "@/components/sections/FounderFeature";
import { AchievementsStrip } from "@/components/sections/AchievementsStrip";
import { SafetyFirst } from "@/components/sections/SafetyFirst";
import { ReviewsCompact } from "@/components/sections/ReviewsCompact";
import { SeeUsInAction } from "@/components/sections/SeeUsInAction";
import { ScheduleBlock } from "@/components/sections/ScheduleBlock";
import { Plans } from "@/components/sections/Plans";
import { ReassuranceChips } from "@/components/sections/ReassuranceChips";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { JsonLd } from "@/components/seo/JsonLd";
import { faqJsonLd, coursesJsonLd, reviewsJsonLd, instrumentCoursesJsonLd } from "@/lib/seo";

export default function HomePage() {
  // A short, proof-first parent homepage:
  // experience → achievements → trust → schedule → fees → book.
  return (
    <>
      <JsonLd data={[faqJsonLd(), coursesJsonLd(), instrumentCoursesJsonLd(), reviewsJsonLd()]} />
      <HeroConcierge />        {/* 1 · Who + how experienced + one action */}
      <FounderFeature />       {/* 2 · The spine — experience & recognition */}
      <AchievementsStrip />    {/* 3 · Fast proof row */}
      <SafetyFirst />          {/* Child safety — highlighted, high on the page */}
      <ReviewsCompact />       {/* 4 · Trust — defence families + premium reviews */}
      <SeeUsInAction />        {/* See us in action — 6 performance clips */}
      <ScheduleBlock />        {/* 5 · How it works / schedule */}
      <Plans />                {/* 6 · Plans & fees */}
      <ReassuranceChips />     {/* Depth compressed to one line */}
      <FAQ limit={6} />        {/* Parent questions only */}
      <FinalCTA
        headline="Book your free trial."
        text="Tell us the instrument and who it's for — we'll match a teacher and confirm your plan on the trial."
      />
    </>
  );
}
