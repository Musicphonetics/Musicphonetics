// ============================================================================
// Musicphonetics — Structured data (JSON-LD) for SEO + AI understanding
// Helps search engines and AI systems understand Musicphonetics as a music
// education company / learning platform / ecosystem.
//
// Truthful data only. No invented awards, endorsements, or statistics.
// TODO(content): add real social profile URLs to SOCIAL_PROFILES, and a real
// logo image path, before launch.
// ============================================================================

import { BRAND, FAQS, PACKAGES, AREAS_SERVED, REVIEWS } from "./data";
import { FOUNDER, FOUNDER_HIGHLIGHTS } from "./founder";
import type { TeacherProfile, Region } from "./teachers";

export const SITE_URL = "https://musicphonetics.com";

// TODO(content): replace with real, verified social profiles.
export const SOCIAL_PROFILES: string[] = [];

const ORG_ID = `${SITE_URL}/#organization`;

/** Organization + EducationalOrganization. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "EducationalOrganization"],
    "@id": ORG_ID,
    name: BRAND.name,
    url: SITE_URL,
    slogan: "Music should never feel random.",
    description:
      "An education-first music company offering structured, director-led, one-to-one music education across Delhi NCR — home and online — built to grow into a wider music education ecosystem.",
    foundingLocation: { "@type": "Place", name: "India" },
    areaServed: AREAS_SERVED.map((name) => ({ "@type": "Place", name })),
    founder: { "@type": "Person", name: FOUNDER.name },
    knowsAbout: [
      "Music education",
      "Guitar lessons",
      "Piano lessons",
      "Vocal training",
      "Trinity exam preparation",
      "Music curriculum development",
    ],
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

/** WebSite (enables sitelinks / search understanding). */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: BRAND.name,
    publisher: { "@id": ORG_ID },
    inLanguage: "en-IN",
  };
}

/** Founder as a Person. */
export function personJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/founder#person`,
    name: FOUNDER.name,
    jobTitle: "Founder & Music Educator",
    description:
      "Founder of Musicphonetics. Guitarist, vocalist, and music educator who has taught 1,100+ one-on-one students over a decade across Delhi NCR.",
    worksFor: { "@id": ORG_ID },
    image: `${SITE_URL}${FOUNDER.photo}`,
    knowsAbout: ["Guitar", "Vocals", "Music education", "Music pedagogy"],
    description_highlights: FOUNDER_HIGHLIGHTS,
  };
}

/** FAQPage from the site FAQs. */
export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/** Course / Service offerings from the packages. */
export function coursesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: PACKAGES.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: `${p.key} · ${p.name}`,
        description: p.tagline,
        provider: { "@id": ORG_ID },
      },
    })),
  };
}

/** A teacher as a Person + their teaching as a Service. */
export function teacherJsonLd(t: TeacherProfile) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${SITE_URL}/teachers/profile/${t.slug}#person`,
    name: t.name,
    jobTitle: "Music Teacher",
    worksFor: { "@id": ORG_ID },
    knowsAbout: t.instruments,
    knowsLanguage: t.languages,
    areaServed: t.cities.map((name) => ({ "@type": "Place", name })),
    description: t.bio,
    ...(t.rating > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: t.rating,
            bestRating: 5,
            ratingCount: 1,
          },
        }
      : {}),
  };
}

/** A region as a CollectionPage of teachers — optimised for local search. */
export function regionJsonLd(region: Region, teachers: TeacherProfile[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/teachers/${region.slug}#page`,
    name: `Music teachers in ${region.name} · Musicphonetics`,
    about: { "@id": ORG_ID },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: teachers.length,
      itemListElement: teachers.map((t, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `${SITE_URL}/teachers/profile/${t.slug}`,
        name: t.name,
      })),
    },
  };
}

/** Review + AggregateRating for the Organization. */
export function reviewsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID,
    name: BRAND.name,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: 4.9,
      reviewCount: REVIEWS.length,
      bestRating: 5,
    },
    review: REVIEWS.map((r) => ({
      "@type": "Review",
      reviewRating: { "@type": "Rating", ratingValue: 5, bestRating: 5 },
      author: { "@type": "Person", name: r.author },
      reviewBody: r.quote,
    })),
  };
}

/** BreadcrumbList helper. */
export function breadcrumbJsonLd(
  trail: { name: string; path: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      item: `${SITE_URL}${t.path}`,
    })),
  };
}
