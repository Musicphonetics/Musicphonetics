// POST /api/delhi-cantt-lead  (PUBLIC — from the /delhi-cantt landing form)
//
// Captures a Delhi Cantt launch-offer lead. The DISCOUNT AND PRICES ARE SET HERE,
// server-side — the browser cannot change them. The lead is emailed to the
// Musicphonetics inbox (the existing Web3Forms lead channel, same as /start) with
// every field the owner needs to identify and action it, plus click-to-call and
// click-to-WhatsApp links. If a `campaign_leads` table + service-role key exist,
// it is ALSO best-effort stored (optional — see supabase/campaign_leads.sql).
//
// Env: WEB3FORMS_ACCESS_KEY (optional; falls back to the public key).
//      SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (optional; email is the fallback).

const WEB3FORMS_FALLBACK = "1a5d9694-46b9-4236-8ced-1b68b65b5097";

// ---- Authoritative offer (server-side truth — never trust the client) ------
// The Delhi Cantt benefit is FIRST MONTH ONLY and applies to the Main Pathway.
const OFFER = {
  active: true,
  plan: "Main Pathway",
  offer_plan: "main_pathway",
  offer_code: "DELHICANTT2000",
  campaign: "delhi_cantt_launch",
  source: "whatsapp_society_group",
  regular_price: 12000,
  first_month_price: 10000,
  discount_amount: 2000,
  classes_per_month: 8,
};

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const clean = (v, n = 200) => String(v ?? "").trim().slice(0, n);

// Indian mobile: 10 digits starting 6–9, tolerant of +91 / 0 / spaces.
function normalisePhone(raw) {
  let d = String(raw ?? "").replace(/\D/g, "");
  if (d.length > 10 && d.startsWith("91")) d = d.slice(-10);
  if (d.length === 11 && d.startsWith("0")) d = d.slice(1);
  return /^[6-9]\d{9}$/.test(d) ? d : null;
}

// Tiny per-isolate rate limiter (abuse protection for a public endpoint).
const HITS = new Map();
function rl(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1; return true;
}

export async function onRequestPost({ request, env }) {
  if (!OFFER.active) return json({ ok: false, error: "This offer is no longer active." }, 410);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rl(`cantt:${ip}`, 6, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  const rawBody = await request.text();
  if (rawBody.length > 8000) return json({ ok: false, error: "Bad request" }, 400);
  let b;
  try { b = JSON.parse(rawBody); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  // Honeypot — must be empty.
  if (clean(b.botcheck, 50)) return json({ ok: true, ref: "ignored" });

  // ---- Validate the fields we actually collect ----
  const learner = clean(b.learner_name, 80);
  const enquirer = clean(b.enquirer_name, 80);
  const phone = normalisePhone(b.phone);
  const area = clean(b.area, 120);
  const age = clean(b.age_group, 40);
  const instrument = clean(b.instrument, 40);
  const mode = clean(b.mode, 40);
  const email = clean(b.email, 160).toLowerCase();
  const goal = clean(b.goal, 400);
  // Interested programme (Foundation / Main Pathway / Director's Circle).
  const planIn = clean(b.plan, 40) || "Main Pathway";
  const isOfferPlan = /main\s*pathway/i.test(planIn);

  if (learner.length < 2) return json({ ok: false, error: "Please enter the learner's first name." }, 400);
  if (!phone) return json({ ok: false, error: "Please enter a valid 10-digit Indian mobile number." }, 400);
  if (area.length < 2) return json({ ok: false, error: "Please enter your Delhi Cantt area." }, 400);
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "That email doesn't look right." }, 400);

  const ref = "MP-DC-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);
  const receivedAt = new Date().toISOString();

  // UTM (attribution only — never affects pricing)
  const utm = {
    source: clean(b.utm_source, 60) || null,
    medium: clean(b.utm_medium, 60) || null,
    campaign: clean(b.utm_campaign, 60) || null,
    content: clean(b.utm_content, 60) || null,
  };

  const row = {
    ref,
    learner_name: learner,
    enquirer_name: enquirer || null,
    phone: "+91" + phone,
    email: email || null,
    age_group: age || null,
    instrument: instrument || null,
    mode: mode || null,
    area,
    goal: goal || null,
    interested_plan: planIn,
    status: "New",
    // Campaign / offer — set on the server, not the client:
    source: OFFER.source,
    campaign: OFFER.campaign,
    offer_code: isOfferPlan ? OFFER.offer_code : null,
    offer_plan: OFFER.offer_plan,
    plan_label: OFFER.plan,
    regular_price: OFFER.regular_price,
    offer_price: isOfferPlan ? OFFER.first_month_price : null,
    discount_amount: isOfferPlan ? OFFER.discount_amount : 0,
    classes_per_month: OFFER.classes_per_month,
    utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, utm_content: utm.content,
    received_at: receivedAt,
  };

  // 1) Best-effort DB store (optional table). Server-side key only.
  let stored = false;
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/campaign_leads`, {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(row),
      });
      stored = res.ok;
    } catch { /* fall through to email */ }
  }

  // 2) Notify the owner — the guaranteed lead channel.
  const waHref = `https://wa.me/91${phone}`;
  const telHref = `tel:+91${phone}`;
  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY || WEB3FORMS_FALLBACK,
        subject: `🎖️ Delhi Cantt Lead — ${learner} (${instrument || "Music"}) · ${planIn} · ${area}`,
        from_name: "Musicphonetics · Delhi Cantt",
        ...(email ? { replyto: email } : {}),
        Reference: ref,
        Status: "New",
        Learner: learner,
        "Age group": age || "-",
        Instrument: instrument || "-",
        Mode: mode || "-",
        Area: area,
        "Enquirer / parent": enquirer || "-",
        WhatsApp: "+91 " + phone,
        "Call": telHref,
        "Open WhatsApp": waHref,
        Email: email || "-",
        "Interested programme": planIn,
        "Learning goal": goal || "-",
        "— Offer —": isOfferPlan
          ? `${OFFER.plan}: first month ₹${OFFER.first_month_price.toLocaleString("en-IN")} instead of ₹${OFFER.regular_price.toLocaleString("en-IN")} (save ₹${OFFER.discount_amount.toLocaleString("en-IN")}), then ₹${OFFER.regular_price.toLocaleString("en-IN")}/mo · ${OFFER.classes_per_month} classes/month`
          : `${planIn}: enquiry at regular terms (Delhi Cantt first-month benefit applies to the Main Pathway only).`,
        "Offer code": isOfferPlan ? OFFER.offer_code : "-",
        Source: OFFER.source,
        Campaign: OFFER.campaign,
        UTM: [utm.source, utm.medium, utm.campaign, utm.content].filter(Boolean).join(" / ") || "-",
        "Received": new Date(receivedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        "Stored in DB": stored ? "Yes (campaign_leads)" : "No — inbox only (add supabase/campaign_leads.sql to enable)",
        "Next step": "Verify teacher availability in Delhi Cantt, then WhatsApp/call the family. Do NOT confirm a seat until availability is verified.",
      }),
    });
  } catch { /* email best-effort */ }

  return json({ ok: true, ref, stored });
}
