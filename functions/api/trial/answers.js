// POST /api/trial/answers  (PUBLIC, token-gated)
// Saves the questionnaire (incl. the two dream songs) and returns the instant,
// personalised curriculum plan — "Your path to <song>". The FACTS are computed
// deterministically by the song engine; a Cloudflare Workers AI layer can later
// rewrite the narration on top (see below) without changing the numbers.
import { json, clean, configured, callRpc, rateLimit, isToken } from "../_trial.js";
import { buildPlan } from "../_songs.js";

export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({ ok: false, error: "Server not configured." }, 503);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rateLimit(`trialans:${ip}`, 40, 60000)) return json({ ok: false, error: "Too many attempts." }, 429);

  const raw = await request.text();
  if (raw.length > 8000) return json({ ok: false, error: "Bad request" }, 400);
  let b; try { b = JSON.parse(raw); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  if (!isToken(b.token)) return json({ ok: false, error: "Invalid session." }, 400);

  const songs = (Array.isArray(b.dream_songs) ? b.dream_songs : [])
    .map((s) => ({ title: clean(s && s.title, 120) || "", lang: clean(s && s.lang, 20) || "" }))
    .filter((s) => s.title)
    .slice(0, 2);

  const plan = buildPlan({
    instrument: clean(b.instrument, 40) || "Guitar",
    songs,
    experienceLevel: clean(b.experience_level, 120) || "",
    startDateISO: null,
  });

  // Optional AI narration upgrade — only if the Cloudflare Workers AI binding is
  // present. It NEVER changes the facts (chords/classes/date); it only warms up
  // the prose. If the binding is missing or errors, we keep the engine's copy.
  if (env.AI && typeof env.AI.run === "function") {
    try {
      const sys = "You are the Musicphonetics guitar mentor: warm, encouraging, concise, honest. Never invent chords, counts or dates — use only the facts given. 2-3 short sentences, no emojis, Indian English.";
      const user = `Learner wants to play "${plan.primary.title}". Facts: chords ${plan.primary.chords.join(", ")}${plan.primary.capo ? `, capo ${plan.primary.capo}` : ""}; about ${plan.primary.classes} classes; can play it by ${plan.primary.playBy} if they start ${plan.startDate}. Write an exciting, personal note that makes them want to start now.`;
      const out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        max_tokens: 180,
      });
      const txt = out && (out.response || out.result || "");
      if (txt && String(txt).trim().length > 20) plan.narration = String(txt).trim();
      plan.aiGenerated = !!txt;
    } catch { /* keep deterministic narration */ }
  }

  try {
    await callRpc(env, "mp_trial_save", {
      p_token: b.token,
      p: {
        experience_level: clean(b.experience_level, 120),
        learning_goal: clean(b.learning_goal, 300),
        preferred_start: clean(b.preferred_start, 60),
        preferred_mode: clean(b.preferred_mode, 40),
        dream_songs: songs,
        answers: b.answers && typeof b.answers === "object" ? b.answers : {},
        plan,
        guitar_reco: plan.guitar,
        status: "assessed",
      },
    });
  } catch {
    // Even if the save hiccups, still return the plan so the visitor sees value.
    return json({ ok: true, plan, saved: false });
  }
  return json({ ok: true, plan, saved: true });
}
