// POST /api/ai/ask  (PUBLIC, free for parents) — answers questions about the
// Musicphonetics curriculum, programs, and policies, grounded in CURRICULUM_CONTEXT.
// Stateless: no database access, so it is safe as a public, rate-limited endpoint.
//
// Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional).

import { json, rateLimited, callGemini, CURRICULUM_CONTEXT } from "./_shared.js";

const SYSTEM = `You are the Musicphonetics learning assistant, helping PARENTS of students.
Answer ONLY from the Musicphonetics knowledge below. Be warm, clear and concise
(2–5 short sentences, or a tight list). Never invent teachers, prices, dates or
policies that are not stated. If asked something outside Musicphonetics learning,
music education, a child's progress, fees or policy, gently steer back and suggest
messaging the team on WhatsApp. Do not give medical, legal or unrelated advice.

MUSICPHONETICS KNOWLEDGE:
${CURRICULUM_CONTEXT}`;

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (rateLimited(`ai-ask:${ip}`, 20, 60000)) return json({ ok: false, error: "You're asking quickly — please wait a moment." }, 429);

  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const question = String(b?.question || "").trim().slice(0, 600);
  if (question.length < 2) return json({ ok: false, error: "Please type a question." }, 400);

  const studentName = String(b?.student_name || "").trim().slice(0, 60);
  const instrument = String(b?.instrument || "").trim().slice(0, 40);
  const ctx = studentName || instrument
    ? `\n\n(Context: the parent's child is ${studentName || "a student"}${instrument ? `, learning ${instrument}` : ""}.)`
    : "";

  const r = await callGemini(env, { system: SYSTEM, user: question + ctx, temperature: 0.5, maxTokens: 700 });
  if (r.error) return json({ ok: false, error: r.error }, r.status || 502);
  return json({ ok: true, answer: r.text.trim() });
}
