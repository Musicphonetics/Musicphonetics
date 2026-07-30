// POST /api/ai/ask  (PUBLIC, free for parents) — answers questions about the
// Musicphonetics curriculum, programs, and policies, grounded in CURRICULUM_CONTEXT.
// Stateless: no database access, so it is safe as a public, rate-limited endpoint.
//
// Env: GEMINI_API_KEY (required), GEMINI_MODEL (optional).

import { json, rateLimited, callGemini, getConfig, CURRICULUM_CONTEXT } from "./_shared.js";

function buildSystem(ownerKnowledge, strict) {
  const strictLine = strict
    ? `STRICT MODE: Answer ONLY what is explicitly covered in the knowledge below. If the
answer is not clearly there, do NOT guess — say you're not sure and suggest messaging
the team on WhatsApp. Refuse anything not about Musicphonetics.`
    : `Answer from the Musicphonetics knowledge below. If asked something outside
Musicphonetics learning, music education, a child's progress, fees or policy, gently
steer back and suggest messaging the team on WhatsApp.`;
  return `You are the Musicphonetics learning assistant, helping PARENTS of students.
Be warm, clear and concise (2–5 short sentences, or a tight list). Never invent
teachers, prices, dates or policies that are not stated. Do not give medical, legal
or unrelated advice. ${strictLine}

MUSICPHONETICS KNOWLEDGE:
${CURRICULUM_CONTEXT}${ownerKnowledge ? `\n\nADDITIONAL OFFICIAL KNOWLEDGE (owner-provided — treat as authoritative):\n${ownerKnowledge}` : ""}`;
}

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

  const cfg = await getConfig(env, ["ai_knowledge", "ai_strict"]);
  const system = buildSystem((cfg.ai_knowledge || "").slice(0, 12000), cfg.ai_strict === "true");

  const r = await callGemini(env, { system, user: question + ctx, temperature: cfg.ai_strict === "true" ? 0.3 : 0.5, maxTokens: 700 });
  if (r.error) return json({ ok: false, error: r.error, detail: r.detail }, r.status || 502);
  return json({ ok: true, answer: r.text.trim() });
}
