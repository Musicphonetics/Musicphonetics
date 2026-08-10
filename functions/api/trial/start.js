// POST /api/trial/start  (PUBLIC)
// Opens a Trial Studio: creates/attaches a CRM lead (dedupe-aware) AND a studio
// session, then returns the secret token the browser uses for the rest of the
// journey. THE CAPTURE HAPPENS HERE — before the exciting questions — so a lead
// is never lost, even if the visitor bounces mid-questionnaire.
import { json, clean, configured, callRpc, rateLimit } from "../_trial.js";

export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({ ok: false, error: "Server not configured." }, 503);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rateLimit(`trial:${ip}`, 20, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  const raw = await request.text();
  if (raw.length > 6000) return json({ ok: false, error: "Bad request" }, 400);
  let b; try { b = JSON.parse(raw); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  // Honeypot
  if (clean(b.botcheck, 50)) return json({ ok: true, token: null });

  const p = {
    student_name: clean(b.student_name, 120),
    parent_name: clean(b.parent_name, 120),
    who: clean(b.who, 40),
    student_age: clean(b.student_age, 40),
    phone: clean(b.phone, 40),
    email: clean(b.email, 160),
    instrument: clean(b.instrument, 40) || "Guitar",
    preferred_mode: clean(b.preferred_mode, 40),
    preferred_area: clean(b.preferred_area, 120),
    experience_level: clean(b.experience_level, 120),
    learning_goal: clean(b.learning_goal, 300),
    source: clean(b.source, 60) || "trial_studio",
    landing_page: clean(b.landing_page, 120) || "/studio",
    utm_source: clean(b.utm_source, 120),
    utm_medium: clean(b.utm_medium, 120),
    utm_campaign: clean(b.utm_campaign, 120),
  };

  const hasContact = (p.phone && p.phone.replace(/\D/g, "").length >= 8) || (p.email && /^\S+@\S+\.\S+$/.test(p.email));
  if (!hasContact) return json({ ok: false, error: "Please share a phone number or email so we can save your studio." }, 400);

  try {
    const r = await callRpc(env, "mp_trial_start", { p });
    if (!r || !r.token) return json({ ok: false, error: "Could not open your studio. Please try again." }, 502);
    return json({ ok: true, token: r.token, lead_code: r.lead_code || null });
  } catch {
    return json({ ok: false, error: "Could not reach the server. Please try again." }, 502);
  }
}
