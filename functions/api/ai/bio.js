// POST /api/ai/bio  (teacher tool) — turns a teacher's questionnaire answers
// into a polished public HEADLINE + BIO. Stateless; the teacher saves the result
// via the mp_submit_teacher_profile RPC. Rate-limited.
//
// AI provider (Cloudflare Pages): Workers AI binding `AI` (free), or GEMINI_API_KEY.

import { json, rateLimited, callAI } from "./_shared.js";

const SYSTEM = `You write short, warm, credible PUBLIC BIOS for music teachers at
Musicphonetics, an Indian music school. Use ONLY the facts the teacher gives —
never invent qualifications, numbers or awards. Warm, professional Indian-English,
third person. Keep it parent-friendly and reassuring.

Output EXACTLY in this format and nothing else:
HEADLINE: <a short role line, e.g. "Guitar & Vocals Instructor · 8+ years">
BIO: <two short paragraphs about who they are, how they teach, and what students gain>`;

function parse(text) {
  const h = text.match(/HEADLINE\s*[:\-]\s*(.+)/i);
  const b = text.match(/BIO\s*[:\-]\s*([\s\S]+)/i);
  return {
    headline: (h ? h[1] : "").trim().replace(/\s+/g, " ").slice(0, 120),
    bio: (b ? b[1] : text).trim().slice(0, 1600),
  };
}

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (rateLimited(`ai-bio:${ip}`, 15, 60000)) return json({ ok: false, error: "Please wait a moment before generating again." }, 429);

  let b; try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const a = b?.answers || {};
  const fields = [
    ["Name", a.name], ["Instruments", a.instruments], ["Years of experience", a.experience_years],
    ["Location", a.location], ["Specialties", a.specialties], ["Qualifications", a.qualifications],
    ["Achievements", a.achievements], ["Age groups taught", a.age_group], ["Languages", a.languages],
    ["Teaching approach", a.approach], ["Why they teach / about them", a.about], ["One line of advice", a.advice],
  ].filter(([, v]) => String(v || "").trim());
  if (fields.length < 2) return json({ ok: false, error: "Fill a few answers first (at least name + instruments)." }, 400);

  const user = "Teacher's answers:\n" + fields.map(([k, v]) => `- ${k}: ${String(v).trim()}`).join("\n") + "\n\nNow write the HEADLINE and BIO.";

  const r = await callAI(env, { system: SYSTEM, user, temperature: 0.6, maxTokens: 700 });
  if (r.error) return json({ ok: false, error: r.error, detail: r.detail }, r.status || 502);

  const out = parse(r.text || "");
  if (!out.bio) return json({ ok: false, error: "The AI didn't return a usable bio. Please try again.", detail: (r.text || "").slice(0, 140) }, 502);
  return json({ ok: true, ...out });
}
