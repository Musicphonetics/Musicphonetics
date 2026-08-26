import type { Metadata } from "next";
import { ExperienceDeck } from "@/components/deck/ExperienceDeck";
import { JsonLd } from "@/components/seo/JsonLd";

const SITE = "https://musicphonetics.com";

export const metadata: Metadata = {
  title: "Music education, built like an institution | Musicphonetics",
  description:
    "A structured, one-to-one music school in Delhi NCR and online - a matched teacher, a real curriculum, tracked progress, and a stage to perform on. Guitar, piano/keyboard & vocals. Book a free trial.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Music education, built like an institution - Musicphonetics",
    description:
      "A structured, one-to-one music school. Matched teacher, real curriculum, tracked progress, a stage to perform on. Delhi NCR + Online.",
    type: "website",
    siteName: "Musicphonetics",
    locale: "en_IN",
  },
};

const localBusiness = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Musicphonetics",
  description:
    "A structured, one-to-one music school - guitar, piano/keyboard and vocal classes for children, beginners and serious learners, at home and online across Delhi NCR.",
  url: SITE,
  areaServed: "Delhi NCR",
  knowsAbout: ["Guitar classes", "Piano classes", "Keyboard classes", "Vocal classes", "Music theory", "Trinity music exam preparation"],
  address: { "@type": "PostalAddress", addressRegion: "Delhi NCR", addressCountry: "IN" },
  makesOffer: [
    { "@type": "Offer", name: "Foundation" },
    { "@type": "Offer", name: "The Main Pathway" },
  ],
};

// The homepage IS the immersive experience. It renders full-screen over the site
// chrome (the deck has a higher z-index), so it feels like an app, not a page.
export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusiness} />
      <ExperienceDeck />
    </>
  );
}
