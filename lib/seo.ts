// ============================================================================
// Musicphonetics — Structured data (JSON-LD) for SEO + AI understanding
// Helps search engines and AI systems understand Musicphonetics as a music
// education company / learning platform / ecosystem.
//
// Truthful data only. No invented awards, endorsements, or statistics.
// TODO(content): add real social profile URLs to SOCIAL_PROFILES, and a real
// logo image path, before launch.
// ============================================================================

import { BRAND, FAQS, PACKAGES, AREAS_SERVED, REVIEWS, INSTAGRAM_URL, PHONE_DISPLAY } from "./data";
import { FOUNDER, FOUNDER_HIGHLIGHTS } from "./founder";
import { INSTRUMENTS } from "./onboarding";
import type { TeacherProfile, Region } from "./teachers";

// Canonical brand domain (used for canonical/sitemap — unchanged for now).
export const SITE_URL = "https://musicphonetics.com";
// Origin that actually serves the live build today — used so OG/share images
// and structured-data images resolve on the current testing domain.
export const OG_ORIGIN = "https://musicphonetics.pages.dev";

export const SOCIAL_PROFILES: string[] = [INSTAGRAM_URL];

const ORG_ID = `${SITE_URL}/#organization`;

/** Organization + LocalBusiness + EducationalOrganization. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "EducationalOrganization"],
    "@id": ORG_ID,
    name: BRAND.name,
    url: SITE_URL,
    image: `${OG_ORIGIN}/og.png`,
    logo: `${OG_ORIGIN}/logo-wordmark-dark.webp`,
    slogan: "Music should never feel random.",
    description:
      "Structured, faculty-led music education across Delhi NCR — home, online, and at our South Delhi centre.",
    telephone: PHONE_DISPLAY,
    foundingLocation: { "@type": "Place", name: "India" },
    areaServed: [
      "South Delhi",
      "Gurugram",
      "Noida",
      "Faridabad",
      "Ghaziabad",
      "Delhi NCR",
      "Online",
    ].map((name) => ({ "@type": "Place", name })),
    founder: { "@type": "Person", name: FOUNDER.name },
    knowsAbout: [
      "Music education",
      "Guitar lessons",
      "Piano lessons",
      "Vocal training",
      "Trinity exam preparation",
      "Music curriculum development",
    ],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: String(REVIEWS.length),
      bestRating: "5",
    },
    ...(SOCIAL_PROFILES.length ? { sameAs: SOCIAL_PROFILES } : {}),
  };
}

/** A Course per instrument (helps instrument-intent search). */
export function instrumentCoursesJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: INSTRUMENTS.map((inst, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Course",
        name: `${inst.label} lessons`,
        description: `Structured, faculty-led ${inst.label} lessons — home and online — across Delhi NCR, with exam preparation where wanted.`,
        provider: { "@id": ORG_ID },
      },
    })),
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
      ratingValue: 5,
      reviewCount: REVIEWS.length,
      bestRating: 5,
    },
    review: REVIEWS.map((r) => ({
      "@type": "Review",
      reviewRating: {
        "@type": "Rating",
        ratingValue: r.rating,
        bestRating: 5,
      },
      author: { "@type": "Person", name: r.name },
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
