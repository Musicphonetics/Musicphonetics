// POST /api/ai/plan  (teacher tool) — turns a teacher's rough notes into a
// structured monthly plan: ONE big goal + exactly 8 defined classes. Stateless
// text transformation (no DB access); the teacher saves the result from the
// client via Supabase RLS. Rate-limited.
//
// AI provider (Cloudflare Pages): a Workers AI binding named `AI` (recommended,
// free — no key), or GEMINI_API_KEY. Optional: CF_AI_MODEL / GEMINI_MODEL.
//
// We ask for a PLAIN-TEXT line format (not JSON) because the free Llama models
// are far more reliable at that, then parse it here.

import { json, rateLimited, callAI, getConfig, CURRICULUM_CONTEXT } from "./_shared.js";
import { PLAN_KNOWLEDGE } from "./_repertoire.js";

const SYSTEM = `You are an expert Indian music teacher planning for Musicphonetics. The
teacher may give only a FEW rough words — read their intent generously and turn it into a
clear ONE-MONTH plan of exactly 8 one-hour classes (the monthly cycle). Each class builds
on the last and ends in a confident little performance.

RULES:
- Use the student's FIRST NAME naturally in the goal and class lines.
- Warm, encouraging Indian-English. Tie wins to family, festivals and school events.
- Pick REAL songs from the SONG BANK that match the instrument and level; prefer Indian
  songs the family will recognise, add a popular English one where it fits. Name the songs.
- Be concrete and practical (what to actually do each class), not vague.

OUTPUT FORMAT — output EXACTLY these 9 lines and NOTHING ELSE (no intro, no markdown):
GOAL: <one motivating sentence naming the student and the month's goal + the song>
1 | <2-5 word title> | <one clear sentence: what happens this class, name songs/skills>
2 | <title> | <focus>
3 | <title> | <focus>
4 | <title> | <focus>
5 | <title> | <focus>
6 | <title> | <focus>
7 | <title> | <focus>
8 | <title> | <focus>
Use the pipe character "|" to separate the number, the title and the focus. Exactly 8 numbered lines.

MUSICPHONETICS METHOD:
${CURRICULUM_CONTEXT}

${PLAN_KNOWLEDGE}`;

// Parse the "GOAL: …" + "n | title | focus" lines into a plan. Tolerant of
// common variations (., ), - or : as separators; missing pipes; stray prose).
function parsePlan(text) {
  const goalMatch = text.match(/GOAL\s*[:\-–]\s*(.+)/i);
  let big_goal = goalMatch ? goalMatch[1].trim() : "";

  const classes = [];
  const lineRe = /^\s*(\d{1,2})\s*[|.):\-–]\s*(.+)$/gm;
  let m;
  while ((m = lineRe.exec(text)) !== null && classes.length < 8) {
    const rest = m[2].trim();
    let title = rest, focus = "";
    if (rest.includes("|")) {
      const parts = rest.split("|").map((s) => s.trim());
      title = parts[0] || "";
      focus = parts.slice(1).join(" ").trim();
    } else {
      // Fallbacks: "Title — focus", "Title: focus", "Title - focus".
      const sep = rest.match(/^(.*?)(?:\s[—–-]\s|:\s)(.+)$/);
      if (sep) { title = sep[1].trim(); focus = sep[2].trim(); }
    }
    classes.push({
      n: classes.length + 1,
      title: (title || `Class ${classes.length + 1}`).slice(0, 80),
      focus: focus.slice(0, 300),
    });
  }
  if (!big_goal && classes[0]) big_goal = `A focused month for ${classes[0].title}.`;
  while (classes.length < 8) classes.push({ n: classes.length + 1, title: `Class ${classes.length + 1}`, focus: "" });
  return { big_goal: big_goal.slice(0, 300), classes, found: classes.filter((c) => c.focus || c.title.indexOf("Class ") !== 0).length };
}

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
Now output the GOAL line and the 8 numbered class lines, exactly in the required format.`;

  const cfg = await getConfig(env, ["ai_knowledge"]);
  const system = cfg.ai_knowledge
    ? `${SYSTEM}\n\nADDITIONAL OFFICIAL KNOWLEDGE (owner-provided):\n${String(cfg.ai_knowledge).slice(0, 8000)}`
    : SYSTEM;

  const r = await callAI(env, { system, user, temperature: 0.6, maxTokens: 1200 });
  if (r.error) return json({ ok: false, error: r.error, detail: r.detail }, r.status || 502);

  const plan = parsePlan(r.text || "");
  if (plan.found < 3) {
    // The model didn't follow the format — surface a short sample for diagnosis.
    return json({ ok: false, error: "The AI didn't return a usable plan. Please try again.", detail: (r.text || "").replace(/\s+/g, " ").slice(0, 160) }, 502);
  }
  return json({ ok: true, plan: { big_goal: plan.big_goal, classes: plan.classes } });
}
