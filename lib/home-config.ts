// ============================================================================
// Musicphonetics homepage funnel — edit content here without touching components.
// ============================================================================

// WhatsApp (shared with the rest of the site via lib/data). Edit the number
// there; the prefilled messages below are funnel-specific.
export { WHATSAPP_NUMBER, whatsappLink } from "@/lib/data";

// Prefilled WhatsApp messages, varied by section so you can see what converts.
export const WA_MSG = {
  hero: "Hi Musicphonetics, I'd like to know more about music classes.",
  why: "Hi Musicphonetics, I'd like help finding the right path for music classes.",
  foundation: "Hi Musicphonetics, I'd like to know about the Foundation plan.",
  main: "Hi Musicphonetics, I'd like to know about the Main Pathway.",
  directors: "Hi Musicphonetics, I'd like to request access to the Director's Circle.",
  packages: "Hi Musicphonetics, I'd like help choosing the right programme.",
  reviews: "Hi Musicphonetics, I saw your reviews and I'd like to know more.",
  process: "Hi Musicphonetics, I'd like to book a free consultation.",
  final: "Hi Musicphonetics, I'd like to start my music journey.",
};

export interface HomePackage {
  key: string;
  name: string;
  price: string | null;      // null → "By request", never a per-class price
  cadence: string | null;    // e.g. "8 classes / month · 1 hour each"
  badge?: string;
  secondaryBadge?: string;
  tagline: string;
  bullets: string[];
  note?: string;
  ctaLabel: string;
  ctaMsg: string;
  featured?: boolean;
  exclusive?: boolean;
}

export const HOME_PACKAGES: HomePackage[] = [
  {
    key: "foundation",
    name: "Foundation",
    price: "₹8,000",
    cadence: "8 classes / month · 1 hour each",
    tagline: "Beginner-only pathway — a clean, correct start.",
    bullets: [
      "Best for absolute beginners",
      "Foundation learning only",
      "No Trinity grades or exam preparation",
      "No advanced progress track",
    ],
    ctaLabel: "Enquire on WhatsApp",
    ctaMsg: WA_MSG.foundation,
  },
  {
    key: "main",
    name: "Main Musicphonetics Pathway",
    price: "₹12,000",
    cadence: "8 classes / month · 1 hour each",
    badge: "Most Recommended",
    secondaryBadge: "Main Pathway",
    tagline: "The full system — for real, lasting progress.",
    bullets: [
      "Serious progress with a strong foundation",
      "Stage confidence, theory, ear training & improvisation",
      "Grade-oriented / Trinity preparation where applicable",
      "Progress tracking with founder & system oversight",
    ],
    note: "Serious students typically move here after ~4 months.",
    ctaLabel: "Choose the Main Pathway",
    ctaMsg: WA_MSG.main,
    featured: true,
  },
  {
    key: "directors",
    name: "Director's Circle",
    price: null,
    cadence: null,
    badge: "By request only",
    tagline: "Direct founder-level mentoring, for a select few.",
    bullets: [
      "By request only",
      "Limited availability",
      "~1 week waiting list",
      "An exclusive, personally guided pathway",
    ],
    ctaLabel: "Request Access on WhatsApp",
    ctaMsg: WA_MSG.directors,
    exclusive: true,
  },
];

// Google review screenshots in public/reviews/. Reorder / swap freely.
// Homepage shows HOME_REVIEW_COUNT of these; /reviews shows all.
export const REVIEWS: string[] = [
  "review-01.webp", "review-02.webp", "review-03.webp", "review-04.webp",
  "review-05.webp", "review-06.webp", "review-07.webp", "review-08.webp",
  "review-09.webp", "review-10.webp", "review-11.webp", "review-12.webp",
  "review-13.webp",
];
export const HOME_REVIEW_COUNT = 8;
