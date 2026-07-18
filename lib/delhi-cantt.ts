// ============================================================================
// Musicphonetics — Delhi Cantt launch offer (single source of truth)
//
// This module centralises ALL copy, pricing and campaign metadata for the
// /delhi-cantt landing page and poster. To pause the offer later, set
// `active: false` (or an `expiresOn` date in the past) here — the landing page
// then hides the form and shows a graceful "offer closed" state, and no other
// file needs editing. The Cloudflare Function (functions/api/delhi-cantt-lead.js)
// independently re-asserts the authoritative prices server-side so the browser
// can never change the discount.
// ============================================================================

import { inr } from "./money";

export interface DelhiCanttOffer {
  active: boolean;
  /** Optional hard stop. `null` = no expiry (offer runs until `active` is set false). ISO date. */
  expiresOn: string | null;
  planLabel: string;
  regularPrice: number;
  offerPrice: number;
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
  offerPrice: 10000,
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
export const OFFER_REGULAR = inr(DELHI_CANTT.regularPrice); // ₹12,000
export const OFFER_PRICE = inr(DELHI_CANTT.offerPrice);     // ₹10,000
export const OFFER_SAVE = inr(DELHI_CANTT.discount);        // ₹2,000

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
}
export function canttWhatsappMessage(d: CanttLeadLite): string {
  return [
    "Hi Musicphonetics, I have submitted the Delhi Cantt Main Pathway enquiry.",
    "",
    `Learner: ${d.name || "-"}`,
    `Age group: ${d.age || "-"}`,
    `Instrument: ${d.instrument || "-"}`,
    `Mode: ${d.mode || "-"}`,
    `Area: ${d.area || "-"}`,
    "",
    `I would like to know the next step for the ${OFFER_SAVE} Delhi Cantt launch benefit.`,
  ].join("\n");
}
