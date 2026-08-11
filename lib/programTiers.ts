// ============================================================================
// Canonical Musicphonetics PRICING TIERS. Edit fees/copy here once — the
// concierge intake, the /learn page and the trial portal read from this.
// (Distinct from lib/programs.ts, which lists instruments & brand divisions.)
// ============================================================================

export interface Tier {
  key: "foundation" | "main" | "signature" | "abhishek";
  name: string;
  tagline: string;
  price: string;
  strike?: string;
  unit?: string;
  badge?: string;
  premium?: boolean;
  forWhom: string;
  note: string;
  points: string[];
}

export const TIERS: Record<Tier["key"], Tier> = {
  foundation: {
    key: "foundation",
    name: "The Foundation",
    tagline: "Beginner module — your correct first start",
    price: "₹10,000",
    unit: "/month",
    forWhom: "Complete beginners only",
    note: "A structured beginner module for those starting from absolute zero. It runs for up to 4 months; moving on to the Main Pathway is subject to a short clearance assessment.",
    points: [
      "8 one-hour classes a month",
      "Only for people starting from scratch",
      "Correct technique, first chords & your first song",
      "Valid up to 4 months, then a clearance check to advance",
    ],
  },
  main: {
    key: "main",
    name: "The Main Pathway",
    tagline: "Where serious students are built",
    price: "₹12,000",
    strike: "₹15,000",
    unit: "/month",
    badge: "Offer — till seats last",
    forWhom: "Anyone past the basics, or ready to get genuinely good",
    note: "The full Musicphonetics system — technique, theory, performance, exam preparation and tracked progress. This is the heart of what we do.",
    points: [
      "8 one-hour classes a month",
      "Theory, performance & Trinity / exam pathway",
      "Full progress tracking in your portal",
      "Quarterly stage performances",
    ],
  },
  signature: {
    key: "signature",
    name: "The Director's Circle",
    tagline: "Priority. Concierge. Zero hassle.",
    price: "By consultation",
    premium: true,
    forWhom: "Families who want the very best service",
    note: "Everything in the Main Pathway, delivered as a white-glove service. Not because a different person teaches — but because the entire experience is built around you and your schedule.",
    points: [
      "A dedicated teacher, held only for you",
      "No class cancellations, ever",
      "Priority booking & flexible rescheduling",
      "Full weekly updates & invitations to exclusive events",
    ],
  },
  abhishek: {
    key: "abhishek",
    name: "Learn with Abhishek",
    tagline: "Directly with the Founder",
    price: "By application",
    premium: true,
    forWhom: "By personal selection only",
    note: "A rare, discretionary place to learn one-to-one with Abhishek, Founder & Director of Musicphonetics. Whether a place opens is entirely at his discretion.",
    points: [
      "Taught personally by Abhishek",
      "Founder-led, one-to-one mentorship",
      "Highly limited — by application",
      "A discretionary, invitation-led place",
    ],
  },
};

export const NON_BEGINNER_ROUTES: Tier["key"][] = ["main", "signature", "abhishek"];
