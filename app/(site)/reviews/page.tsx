import type { Metadata } from "next";
import { PageHero } from "@/components/sections/PageHero";
import { ReviewsShowcase } from "@/components/sections/ReviewsShowcase";

export const metadata: Metadata = {
  title: "Reviews — 5.0 across every review",
  description:
    "Verified Musicphonetics reviews from across Delhi NCR — defence families in Delhi Cantonment, professionals in Dwarka, Vasant Kunj, Green Park, and Gurugram. 5.0 across every review.",
  openGraph: {
    title: "Reviews — trusted across Delhi NCR",
    description:
      "Verified reviews from defence families, professionals, and parents across Delhi NCR. 5.0 across every review.",
  },
};

export default function ReviewsPage() {
  return (
    <>
      <PageHero
        eyebrow="Reviews"
        title="Trust, earned one student at a time."
        intro="Every review is real and collected after real classes. Student reviews are published with first name and initial only, by family consent."
      />
      <ReviewsShowcase />
    </>
  );
}
