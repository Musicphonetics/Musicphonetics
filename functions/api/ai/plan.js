// POST /api/ai/plan  (teacher tool) — turns a teacher's rough notes into a
// structured monthly plan: ONE big goal + exactly 8 defined classes. Stateless
// text transformation (no DB access); the teacher saves the result from the
// client via Supabase RLS. Rate-limited.
//
// AI provider (Cloudflare Pages): a Workers AI binding named `AI` (recommended,
// free — no key), or GEMINI_API_KEY. Optional: CF_AI_MODEL / GEMINI_MODEL.

import { json, rateLimited, callAI, getConfig, CURRICULUM_CONTEXT } from "./_shared.js";
import { PLAN_KNOWLEDGE } from "./_repertoire.js";

const SYSTEM = `You are an expert Indian music teacher planning for Musicphonetics. The
teacher may give only a FEW rough words — read their intent generously and turn it into a
clear ONE-MONTH plan of exactly 8 one-hour classes (the monthly cycle). Each class builds
on the last and ends in a confident little performance.

RULES:
- Use the student's FIRST NAME naturally in the big_goal and in class focus lines.
- Warm, encouraging Indian-English. Tie wins to family, festivals and school events.
- Pick REAL songs from the SONG BANK that match the instrument and level; prefer Indian
  songs the family will recognise, add a popular English one where it fits. Name the songs.
- Be concrete and practical (what to actually do each class), not vague.
- Choose the right stage of the four-month arc for the student's level.

Return STRICT JSON only, matching exactly:
{
  "big_goal": "one motivating sentence naming the student and the month's goal (and the song they'll be able to play)",
  "classes": [
    { "n": 1, "title": "short 2-5 word title", "focus": "one clear, specific sentence — what happens this class, naming songs/skills" }
  ]
}
"classes" MUST have exactly 8 items, n from 1 to 8. No text, notes or markdown outside the JSON.

MUSICPHONETICS METHOD:
${CURRICULUM_CONTEXT}

${PLAN_KNOWLEDGE}`;

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (rateLimited(`ai-plan:${ip}`, 15, 60000)) return json({ ok: false, error: "Please wait a moment before generating again." }, 429);

  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const notes = String(b?.notes || "").trim().slice(0, 1200);
  if (notes.length < 3) return json({ ok: false, error: "Write a few words about the month's focus first." }, 400);

  const name = String(b?.student_name || "").trim().slice(0, 60);
  const instrument = String(b?.instrument || "").trim().slice(0, 40);
  const level = String(b?.level || "").trim().slice(0, 40);
  const program = String(b?.program || "").trim().slice(0, 40);

  const user = `Student: ${name || "the student"}${instrument ? ` · Instrument: ${instrument}` : ""}${level ? ` · Level: ${level}` : ""}${program ? ` · Program: ${program}` : ""}.
Teacher's rough notes for this month:
"""
${notes}
"""
Produce the JSON plan (one big_goal + exactly 8 classes).`;

  const cfg = await getConfig(env, ["ai_knowledge"]);
  const system = cfg.ai_knowledge
    ? `${SYSTEM}\n\nADDITIONAL OFFICIAL KNOWLEDGE (owner-provided):\n${String(cfg.ai_knowledge).slice(0, 12000)}`
    : SYSTEM;

  const r = await callAI(env, { system, user, wantJson: true, temperature: 0.7, maxTokens: 1400 });
  if (r.error) return json({ ok: false, error: r.error, detail: r.detail }, r.status || 502);

  let plan;
  try {
    plan = JSON.parse(r.text);
  } catch {
    // Salvage a JSON object if the model wrapped it in stray text.
    const m = r.text.match(/\{[\s\S]*\}/);
    try { plan = m ? JSON.parse(m[0]) : null; } catch { plan = null; }
  }
  if (!plan || !Array.isArray(plan.classes)) {
    return json({ ok: false, error: "The AI response wasn't in the expected format. Please try again." }, 502);
  }

  // Normalise to exactly 8 numbered classes.
  const classes = plan.classes.slice(0, 8).map((c, i) => ({
    n: i + 1,
    title: String(c?.title || `Class ${i + 1}`).trim().slice(0, 80),
    focus: String(c?.focus || "").trim().slice(0, 300),
  }));
  while (classes.length < 8) classes.push({ n: classes.length + 1, title: `Class ${classes.length + 1}`, focus: "" });

  return json({
    ok: true,
    plan: { big_goal: String(plan.big_goal || "").trim().slice(0, 300), classes },
  });
}
