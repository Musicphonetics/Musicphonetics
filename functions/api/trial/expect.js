// POST /api/trial/expect  (PUBLIC)
// Returns an elaborated "what to expect in your trial" for a learner's dream
// songs. Chord FACTS come only from the verified database (never invented); the
// warm, personal prose is written by Cloudflare Workers AI when the binding is
// present, with a rich template fallback. No account/secret needed — just songs.
import { chordInfo } from "../_chords.js";

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const clean = (v, n = 120) => (v == null ? "" : String(v).trim().slice(0, n));

export async function onRequestPost({ request, env }) {
  let b; try { b = await request.json(); } catch { return json({ ok: false }, 400); }
  const instrument = clean(b.instrument, 40) || "Guitar";
  const name = clean(b.student_name, 60);
  const rawSongs = Array.isArray(b.songs) ? b.songs : [];
  const songs = rawSongs.map((s) => chordInfo(typeof s === "string" ? s : (s && s.title))).filter((s) => s.title).slice(0, 2);

  // Per-song honest line.
  const songBlocks = songs.map((s) => {
    if (s.matched) {
      const capo = s.capo ? `, with a capo on fret ${s.capo}` : "";
      return {
        title: s.title, artist: s.artist, matched: true, chords: s.chords, capo: s.capo || 0,
        line: `“${s.title}” is built on ${s.chords.length} chords — ${s.chords.join(", ")}${capo}. In the trial your teacher will show you how these shapes sit under your fingers and how they move from one to the next, so you hear the song start to take shape.`,
      };
    }
    return {
      title: s.title, matched: false, chords: [],
      line: `Your teacher will map out “${s.title}” for you in the trial and pick the perfect first chords to start with, so it feels achievable from day one.`,
    };
  });

  const chordFacts = songBlocks.filter((s) => s.matched).map((s) => `${s.title}: ${s.chords.join(", ")}${s.capo ? ` (capo ${s.capo})` : ""}`).join("; ");

  const assess = [
    "Your natural sense of rhythm and musical ear",
    "How your hands take to the instrument",
    "The right starting point and pace for you",
    "How we’ll shape your first month around your songs",
  ];
  const partner = `If you don't own ${instrument === "Guitar" ? "a guitar" : `a ${instrument.toLowerCase()}`} yet, don't worry — your teacher will guide you on exactly what to get, and our partner Music-AL store offers Musicphonetics families a special price. You can also borrow one for your first few classes.`;

  // Warm intro paragraph — AI if available, else template.
  let intro =
    `Your trial is a focused 45 to 60 minute one-to-one class, built entirely around ${name || "you"}. ` +
    `It is a real lesson, not a sales pitch — you'll actually make music in it. Your teacher arrives already knowing your goals and the songs you love, so no time is wasted.`;

  if (env && env.AI && typeof env.AI.run === "function") {
    try {
      const sys = "You are the Musicphonetics guitar mentor: warm, encouraging, concise, honest, Indian English. Use ONLY the facts given. Never invent chords, counts or dates. 3-4 short sentences. No emojis.";
      const user =
        `Write an exciting, personal paragraph on what to expect in a 45-60 min one-to-one ${instrument} trial for ${name || "a new student"}. ` +
        (chordFacts ? `They dream of playing: ${chordFacts}. Mention that the teacher will start them on these real chords. ` : "") +
        `Make them feel this trial is the first real step, not a demo.`;
      const out = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", { messages: [{ role: "system", content: sys }, { role: "user", content: user }], max_tokens: 220 });
      const txt = out && (out.response || out.result || "");
      if (txt && String(txt).trim().length > 40) intro = String(txt).trim();
    } catch { /* keep template */ }
  }

  return json({ ok: true, duration: "45–60 minutes, one-to-one", intro, songs: songBlocks, assess, partner });
}
