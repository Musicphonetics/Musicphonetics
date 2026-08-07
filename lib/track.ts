// Channel-agnostic conversion tracking. Fires to Google (Analytics / Ads) and
// Meta Pixel if they're configured; a no-op otherwise. Safe on the server.
//
// Standard events used across the site:
//   generate_lead   — the trial/enquiry form was submitted successfully
//   book_trial      — a "Book a trial" CTA was clicked
//   contact_whatsapp / contact_call / contact_email — outbound contact clicks
export function track(name: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void };
  try { w.gtag?.("event", name, params || {}); } catch { /* ignore */ }
  try {
    if (w.fbq) {
      const std: Record<string, string> = { generate_lead: "Lead", book_trial: "Lead", contact_whatsapp: "Contact", contact_call: "Contact" };
      if (std[name]) w.fbq("track", std[name], params || {});
      else w.fbq("trackCustom", name, params || {});
    }
  } catch { /* ignore */ }
}
