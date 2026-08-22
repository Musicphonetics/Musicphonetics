// POST /api/ai/report  (teacher tool) — drafts a warm, celebratory progress
// report from the REAL class notes for a set of classes, plus the teacher's own
// instructions on how they want it written. Stateless text transformation; the
// teacher reviews and edits every word on the client before it becomes a PDF.
//
// It never invents specific facts (songs, exam grades) that aren't in the notes
// — it works from what actually happened in class. If notes are thin, it stays
// general but honest and encouraging.

import { json, rateLimited, callAI, CURRICULUM_CONTEXT } from "./_shared.js";

const SYSTEM = `You are an expert, warm Indian music teacher at Musicphonetics writing a
PROGRESS REPORT that a proud family will read. It is a moment of celebration.

GROUNDING — this is the most important rule:
- Work ONLY from the class notes provided (what was taught, homework, the student's
  responses). Do NOT invent specific songs, skills, grades or facts that are not in
  the notes. If the notes are thin, stay general but sincere — never fabricate.
- Honour the teacher's own instructions about tone and focus.

STYLE:
- Warm, proud, encouraging Indian-English. Use the student's FIRST NAME naturally.
- Concrete and specific to THIS student's actual classes, not generic filler.
- Growth areas must be kind and constructive — framed as the exciting next step.

OUTPUT — output EXACTLY these labelled blocks and nothing else (no markdown, no intro):
HEADLINE: <one celebratory sentence naming the student and what they achieved>
OBSERVATIONS: <2-4 warm sentences on how they showed up, engaged and grew>
ACHIEVEMENTS:
- <a concrete win from the notes>
- <another>
- <another>
IMPROVEMENTS:
- <a gentle area to grow + one practical way to work on it>
- <another>
NEXT: <2-3 sentences on what comes next in their journey>

MUSICPHONETICS METHOD (context only):
${CURRICULUM_CONTEXT}`;

function block(text, label, nextLabels) {
  const stop = nextLabels.map((l) => `${l}:`).join("|");
  const re = new RegExp(`${label}:\\s*([\\s\\S]*?)(?=\\n\\s*(?:${stop})\\s*:|$)`, "i");
  const m = text.match(re);
  return m ? m[1].trim() : "";
}
function bullets(s) {
  return s.split(/\n+/).map((l) => l.replace(/^[\s\-•*]+/, "").trim()).filter(Boolean).join("\n");
}

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "anon";
  if (rateLimited(`report:${ip}`, 20, 60_000)) return json({ error: "Please wait a moment and try again." }, 429);

  let body;
  try { body = await request.json(); } catch { return json({ error: "Bad request." }, 400); }
  const name = String(body.name || "The student").trim();
  const instrument = String(body.instrument || "music").trim();
  const level = String(body.level || "").trim();
  const goal = String(body.goal || "").trim();
  const prompt = String(body.prompt || "").trim().slice(0, 1200);
  const classes = Array.isArray(body.classes) ? body.classes.slice(0, 16) : [];

  const notes = classes.map((c, i) => {
    const parts = [c.taught && `taught: ${c.taught}`, c.homework && `homework: ${c.homework}`, c.response && `response: ${c.response}`].filter(Boolean).join("; ");
    return `Class ${i + 1}${c.date ? ` (${c.date})` : ""}: ${parts || "class completed"}`;
  }).join("\n");

  const user = [
    `Student: ${name}. Instrument: ${instrument}.${level ? ` Level: ${level}.` : ""}`,
    goal ? `This period's goal: ${goal}` : "",
    prompt ? `The teacher wants this report written like this: ${prompt}` : "",
    "",
    "CLASS NOTES (the only facts you may use):",
    notes || "(no detailed notes were recorded for these classes)",
    "",
    `Write ${name}'s progress report now, following the exact labelled format.`,
  ].filter(Boolean).join("\n");

  const res = await callAI(env, { system: SYSTEM, user, temperature: 0.6, maxTokens: 900 });
  if (res.error) return json({ error: res.error, detail: res.detail }, res.status || 502);

  const text = res.text;
  const labels = ["HEADLINE", "OBSERVATIONS", "ACHIEVEMENTS", "IMPROVEMENTS", "NEXT"];
  const out = {
    headline: block(text, "HEADLINE", ["OBSERVATIONS", "ACHIEVEMENTS", "IMPROVEMENTS", "NEXT"]).replace(/\n+/g, " ").trim(),
    observations: block(text, "OBSERVATIONS", ["ACHIEVEMENTS", "IMPROVEMENTS", "NEXT"]).replace(/\n+/g, " ").trim(),
    achievements: bullets(block(text, "ACHIEVEMENTS", ["IMPROVEMENTS", "NEXT"])),
    improvements: bullets(block(text, "IMPROVEMENTS", ["NEXT"])),
    next: block(text, "NEXT", []).replace(/\n+/g, " ").trim(),
  };
  // If parsing failed entirely, hand back the raw text as observations so the
  // teacher still gets something to edit rather than an empty form.
  if (!out.headline && !out.observations && !out.achievements) out.observations = text.trim();
  void labels;
  return json({ ok: true, ...out });
}
