// ============================================================================
// Musicphonetics homepage funnel - edit content here without touching components.
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
  events: "Hi Musicphonetics, I'd like to know about the South Delhi centre and the open mic events.",
  final: "Hi Musicphonetics, I'd like to start my music journey.",
};

export interface HomePackage {
  key: string;
  name: string;
  price: string | null;      // null → "By request", never a per-class price
  payAmount: number | null;  // ₹ for instant Cashfree enrolment; null → WhatsApp only
  cadence: string | null;    // e.g. "8 classes / month · 1 hour each"
  badge?: string;
  secondaryBadge?: string;
  tagline: string;
  bullets: string[];
  forWho: string[];          // "View details" - who it's for
  notForWho: string[];       // who it's NOT for
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
    payAmount: 8000,
    cadence: "8 classes / month · 1 hour each",
    tagline: "Beginner-only pathway - a clean, correct start.",
    bullets: [
      "Best for absolute beginners",
      "Foundation learning only",
      "No Trinity grades or exam preparation",
      "No advanced progress track",
    ],
    forWho: [
      "Absolute beginners - children or adults",
      "Anyone wanting a calm, correct first start",
      "Casual learners exploring an instrument",
      "Parents testing if their child enjoys music",
    ],
    notForWho: [
      "Students who want Trinity grades or exam prep",
      "Anyone chasing fast, advanced progress",
      "Serious performance or competition goals",
    ],
    ctaLabel: "Enquire on WhatsApp",
    ctaMsg: WA_MSG.foundation,
  },
  {
    key: "main",
    name: "Main Musicphonetics Pathway",
    price: "₹12,000",
    payAmount: 12000,
    cadence: "8 classes / month · 1 hour each",
    badge: "Most Recommended",
    secondaryBadge: "Main Pathway",
    tagline: "The full system - for real, lasting progress.",
    bullets: [
      "Serious progress with a strong foundation",
      "Stage confidence, theory, ear training & improvisation",
      "Grade-oriented / Trinity preparation where applicable",
      "Progress tracking with founder & system oversight",
    ],
    forWho: [
      "Serious learners committed to real progress",
      "Kids, teens & adults who want structure, theory & performance",
      "Students aiming for Trinity grades / exams",
      "Anyone who wants a clear long-term musical direction",
    ],
    notForWho: [
      "Someone wanting only a few casual songs",
      "Learners who don't want any structure or tracking",
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
    payAmount: null,
    cadence: null,
    badge: "By request only",
    tagline: "Direct founder-level mentoring, for a select few.",
    bullets: [
      "By request only",
      "Limited availability",
      "~1 week waiting list",
      "An exclusive, personally guided pathway",
    ],
    forWho: [
      "Advanced or highly committed students",
      "Those wanting direct founder-level mentoring",
      "Performance, audition or competition level",
      "Students happy to wait for a limited slot",
    ],
    notForWho: [
      "Beginners or first-time learners",
      "Casual, exploratory students",
    ],
    ctaLabel: "Request Access on WhatsApp",
    ctaMsg: WA_MSG.directors,
    exclusive: true,
  },
];

// Hero slideshow - real student & performance photos, text overlaid.
export const HERO_SLIDES: string[] = [
  "/images/hero/slide-1.webp",
  "/images/hero/slide-2.webp",
  "/images/hero/slide-3.webp",
  "/images/hero/slide-4.webp",
  "/images/hero/slide-5.webp",
];

// Real, unstaged moments from our classes, recitals and student wins across
// Delhi NCR. No stock photos - these are our people.
export interface Moment { src: string; alt: string; caption: string }
export const REAL_MOMENTS: Moment[] = [
  { src: "/images/moments/03-stage-guitar.webp", alt: "A Musicphonetics student performing guitar on a large stage", caption: "On the big stage, where months of practice pay off." },
  { src: "/images/moments/02-openmic.webp", alt: "A student singing and playing guitar at an Open Mic and Chai evening", caption: "Open Mic and Chai, our students take the mic." },
  { src: "/images/moments/05-group.webp", alt: "Musicphonetics students celebrating an award together in class", caption: "Student of the term, celebrated together." },
  { src: "/images/moments/04-award.webp", alt: "Founder Abhishek Kumar receiving a certificate of appreciation as a judge", caption: "Invited to judge a Delhi cultural fest." },
  { src: "/images/moments/08-stage.webp", alt: "A Musicphonetics student meeting a musician backstage", caption: "Learning from the musicians who inspire us." },
  { src: "/images/moments/09-mentor.webp", alt: "A one-on-one music lesson between teacher and student", caption: "One student, one teacher, full attention." },
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
