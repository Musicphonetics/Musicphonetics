// POST /api/ai/plan  (teacher tool) — turns a teacher's rough notes into a
// structured monthly plan: ONE big goal + exactly 8 defined classes. Stateless
// text transformation (no DB access); the teacher saves the result from the
// client via Supabase RLS. Rate-limited.
//
// Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional).

import { json, rateLimited, callGemini, CURRICULUM_CONTEXT } from "./_shared.js";

const SYSTEM = `You are a music teaching planner for Musicphonetics. Turn a teacher's
rough notes into a clear ONE-MONTH plan of exactly 8 one-hour classes (the monthly
cycle). Ground it in the Musicphonetics method below. Make it concrete, sequential
and encouraging — each class builds on the last, ending in a small win/performance.

Return STRICT JSON only, matching exactly:
{
  "big_goal": "one motivating sentence — the single goal for the month",
  "classes": [
    { "n": 1, "title": "short 2-5 word title", "focus": "one clear sentence on what happens this class" }
  ]
}
"classes" MUST have exactly 8 items, n from 1 to 8. No text outside the JSON.

MUSICPHONETICS METHOD:
${CURRICULUM_CONTEXT}`;

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

  const r = await callGemini(env, { system: SYSTEM, user, wantJson: true, temperature: 0.7, maxTokens: 1400 });
  if (r.error) return json({ ok: false, error: r.error }, r.status || 502);

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
