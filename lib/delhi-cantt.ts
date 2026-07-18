// ============================================================================
// Musicphonetics — Delhi Cantt launch offer (single source of truth)
//
// This module centralises ALL copy, pricing, package comparison and campaign
// metadata for the /delhi-cantt landing page and poster. To pause the offer
// later, set `active: false` (or an `expiresOn` date in the past) here — the
// landing page then hides the claim flow and shows a graceful "closed" state,
// and no other file needs editing. The Cloudflare Function
// (functions/api/delhi-cantt-lead.js) independently re-asserts the authoritative
// prices server-side so the browser can never change the discount.
//
// The Delhi Cantt benefit is FIRST MONTH ONLY: ₹10,000 for month one, then the
// regular ₹12,000/month — and it applies to the Main Pathway only. Foundation
// and Director's Circle are shown for comparison at their normal terms.
// ============================================================================

import { inr } from "./money";

export interface DelhiCanttOffer {
  active: boolean;
  /** Optional hard stop. `null` = no expiry (offer runs until `active` is set false). ISO date. */
  expiresOn: string | null;
  planLabel: string;
  regularPrice: number;
  firstMonthPrice: number;
  discount: number;
  classesPerMonth: number;
  instrumentsLine: string;
  // Campaign values (also enforced server-side; these are for display + email).
  offerCode: string;
  campaign: string;
  source: string;
  offerPlan: string;
  eligibilityNote: string;
}

export const DELHI_CANTT: DelhiCanttOffer = {
  active: true,
  expiresOn: null,
  planLabel: "Main Pathway",
  regularPrice: 12000,
  firstMonthPrice: 10000,
  discount: 2000,
  classesPerMonth: 8,
  instrumentsLine: "Guitar • Piano • Vocals • Drums • Violin • More",
  offerCode: "DELHICANTT2000",
  campaign: "delhi_cantt_launch",
  source: "whatsapp_society_group",
  offerPlan: "main_pathway",
  eligibilityNote:
    "Available for new learners residing in Delhi Cantt. Teacher availability and learning mode are subject to confirmation.",
};

/** True only while the offer is switched on and (if set) not past its expiry. */
export function offerIsLive(o: DelhiCanttOffer = DELHI_CANTT): boolean {
  if (!o.active) return false;
  if (o.expiresOn) return new Date(o.expiresOn).getTime() >= Date.now();
  return true;
}

// Pre-formatted strings so display never drifts from the numbers above.
export const OFFER_REGULAR = inr(DELHI_CANTT.regularPrice);      // ₹12,000
export const OFFER_FIRST_MONTH = inr(DELHI_CANTT.firstMonthPrice); // ₹10,000
export const OFFER_SAVE = inr(DELHI_CANTT.discount);            // ₹2,000

// ---- The three packages (for comparison + choice) --------------------------
export interface Package {
  key: "foundation" | "main_pathway" | "directors_circle";
  name: string;
  priceLabel: string;      // display price
  priceSub: string;        // small line under the price
  bestFor: string;
  features: string[];
  offer?: string;          // Delhi Cantt benefit line (Main Pathway only)
  featured?: boolean;
}

export const PACKAGES: Package[] = [
  {
    key: "foundation",
    name: "Foundation",
    priceLabel: "₹8,000",
    priceSub: "per month",
    bestFor: "New & young beginners",
    features: [
      "Structured 32-class beginner pathway",
      "Curriculum progress bar",
      "Homework & attendance tracking",
      "Monthly goals & parent updates",
    ],
  },
  {
    key: "main_pathway",
    name: "Main Pathway",
    priceLabel: "₹12,000",
    priceSub: "per month",
    bestFor: "Committed, progressing learners",
    features: [
      "Personalised monthly goals",
      "Teacher-defined outcomes & reports",
      "Structured ongoing development",
      "Homework, attendance & parent visibility",
    ],
    offer: "Delhi Cantt: first month ₹10,000 (save ₹2,000)",
    featured: true,
  },
  {
    key: "directors_circle",
    name: "Director's Circle",
    priceLabel: "By consultation",
    priceSub: "premium mentorship",
    bestFor: "Serious & advanced learners",
    features: [
      "Premium personal mentorship",
      "Bespoke learning direction",
      "Higher-touch guidance",
      "Director involvement · by prior booking",
    ],
  },
];

// Form choices reference these package names.
export const PACKAGE_CHOICES = PACKAGES.map((p) => p.name);

// ---- Form option sets (kept small + offer-specific) ------------------------
export const CANTT_AGE_GROUPS = ["Under 6", "6–10", "11–14", "15–18", "Adult (18+)"];
export const CANTT_INSTRUMENTS = ["Guitar", "Piano", "Vocals", "Drums", "Violin", "Keyboard", "Ukulele", "Not sure yet"];
export const CANTT_MODES = ["Home", "Online", "Centre", "Help me decide"];

// ---- Campaign share URL (poster QR + WhatsApp) -----------------------------
export const CANTT_PATH = "/delhi-cantt";
export const CANTT_SHARE_URL =
  "https://musicphonetics.com/delhi-cantt?utm_source=whatsapp&utm_medium=society_group&utm_campaign=delhi_cantt_launch&utm_content=poster";

// ---- WhatsApp handoff message (success screen) -----------------------------
export interface CanttLeadLite {
  name?: string;
  age?: string;
  instrument?: string;
  mode?: string;
  area?: string;
  plan?: string;
}
export function canttWhatsappMessage(d: CanttLeadLite): string {
  return [
    "Hi Musicphonetics, I have submitted the Delhi Cantt enquiry.",
    "",
    `Learner: ${d.name || "-"}`,
    `Age group: ${d.age || "-"}`,
    `Instrument: ${d.instrument || "-"}`,
    `Mode: ${d.mode || "-"}`,
    `Area: ${d.area || "-"}`,
    `Interested in: ${d.plan || "Main Pathway"}`,
    "",
    `I would like to know the next step${(d.plan || "Main Pathway") === "Main Pathway" ? ` for the ${OFFER_SAVE} first-month Delhi Cantt benefit` : ""}.`,
  ].join("\n");
}
