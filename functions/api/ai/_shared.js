// Shared helpers for the Gemini-backed AI endpoints. Underscore-prefixed, so
// Cloudflare Pages does NOT expose this as a route — it is imported by the
// sibling functions. The GEMINI_API_KEY lives only in the environment and never
// reaches the browser.

export const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

// Per-isolate rate limit (generous; throttles a single abusive IP).
const HITS = new Map();
export function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return false; }
  if (rec.count >= limit) return true;
  rec.count += 1; return false;
}

// What Musicphonetics is — the knowledge the parent Q&A answers from, and the
// grounding for the teacher plan generator. Kept concise and factual.
export const CURRICULUM_CONTEXT = `
MUSICPHONETICS — structured, faculty-led, one-to-one music education.
Founded 2015 by Abhishek Kumar. Delhi NCR (home visits), live online (anywhere),
and a South Delhi centre. Instruments: guitar, piano/keyboard, vocals, ukulele,
violin, drums and more. 10+ years teaching, 1,100+ students, 200+ Trinity passes.

METHOD: every student gets ONE teacher matched to them, ONE clear structured
method, and every class is tracked. Progress is deliberate and long-term — real
musicianship, not random song copying.

PROGRAMS & PRICING (per month, 8 classes/month, one hour each):
- Foundation — ₹10,000/mo (offer) / ₹15,000 list. A 32-class beginner journey in
  4 stages of 8 classes:
    1) EXPLORE (classes 1–8): posture, first clean sound, rhythm, practice habit.
    2) PLAY (9–16): first notes/chords/scales, steady rhythm, first song section.
    3) MAKE MUSIC (17–24): full songs with timing and growing confidence.
    4) PERFORM (25–32): a performance piece; readiness for the Main Pathway.
- Main Musicphonetics Pathway — ₹15,000/mo. Ongoing structured growth: theory,
  ear training, technique, performance; a fresh monthly goal each month.
- Director's Circle — by consultation (fees set personally). Direct mentorship
  personally with the Director. One big monthly goal broken into 8 defined
  mentorship classes; concierge scheduling; showcase performances.

FEES & POLICY: billed monthly, in advance, only in the Musicphonetics name via a
secure gateway. The first month is pro-rated from the start date to the month
end; after that it is the same amount on the 1st of each month. 8 classes are to
be completed within 35 days of the cycle start. Missed classes are rescheduled
where possible, subject to teacher availability. To pause/withdraw, tell the
office before the next billing date. Completed months are non-refundable.

TRIALS & CONTACT: families can book a FREE trial (no payment) via the website
form; the team matches a teacher and schedules it. Exam pathway: Trinity-
recognised graded preparation. Support is on WhatsApp and the parent portal.
`.trim();

// Read owner-managed settings from app_config (via the service role, same as
// the lead endpoint). Lets the owner "train" the assistant without a deploy.
export async function getConfig(env, keys) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return {};
  try {
    const inList = keys.map((k) => `"${k}"`).join(",");
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/app_config?key=in.(${inList})&select=key,value`, {
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    if (!res.ok) return {};
    const rows = await res.json();
    const out = {};
    for (const r of rows) out[r.key] = r.value;
    return out;
  } catch { return {}; }
}

// Call Gemini. `wantJson` requests a strict JSON body. Returns the model text.
export async function callGemini(env, { system, user, wantJson, temperature = 0.6, maxTokens = 1024 }) {
  const key = env.GEMINI_API_KEY;
  if (!key) return { error: "AI is not configured yet. Set GEMINI_API_KEY in Cloudflare Pages.", status: 503 };
  const model = env.GEMINI_MODEL || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [{ role: "user", parts: [{ text: user }] }],
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
      ...(wantJson ? { responseMimeType: "application/json" } : {}),
    },
  };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      let msg = "";
      try { msg = JSON.parse(t)?.error?.message || ""; } catch { /* not json */ }
      return { error: "AI request failed.", status: 502, detail: `${res.status} ${(msg || t).slice(0, 220)}` };
    }
    const data = await res.json();
    const cand = data?.candidates?.[0];
    const text = cand?.content?.parts?.map((p) => p.text).join("") ?? "";
    if (!text) {
      const why = cand?.finishReason || data?.promptFeedback?.blockReason || "empty response";
      return { error: "The AI returned no answer.", status: 502, detail: String(why).slice(0, 120) };
    }
    return { text };
  } catch (e) {
    return { error: "Couldn't reach the AI service.", status: 502, detail: String(e).slice(0, 200) };
  }
}
