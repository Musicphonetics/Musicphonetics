// ============================================================================
// Musicphonetics - enrolment hand-off.
// The parent fills the enrolment form on /pay (instrument, level, days, mode,
// start date). We stash it in localStorage before sending them to Cashfree,
// then read it back on /welcome so the enrolment document reflects THEIR
// choices - it is never pre-filled by the office.
// ============================================================================

export const ENROL_KEY = "mp_enrolment";

// Days of the week for the "preferred days" multi-select. Classes run twice a
// week (or more), so more than one day can be chosen.
export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export interface Enrolment {
  planKey: string;
  planName: string;
  monthly: number;
  name: string;
  instrument: string;
  level: string;
  mode: string;
  days: string[];
  startDate: string; // ISO yyyy-mm-dd
  firstPayment: number;
  agreedAt: string;  // ISO timestamp - terms accepted before payment
  savedAt: string;   // ISO timestamp
}

export function saveEnrolment(e: Enrolment) {
  try {
    localStorage.setItem(ENROL_KEY, JSON.stringify(e));
  } catch {
    /* storage unavailable - the office still confirms everything on WhatsApp */
  }
}

export function loadEnrolment(): Enrolment | null {
  try {
    const raw = localStorage.getItem(ENROL_KEY);
    if (!raw) return null;
    const e = JSON.parse(raw) as Enrolment;
    // Only trust a recent enrolment (48h) so a stale one never shows on /welcome.
    if (e.savedAt && Date.now() - new Date(e.savedAt).getTime() > 48 * 3600 * 1000) return null;
    return e;
  } catch {
    return null;
  }
}
