// POST /api/ai/journey  — the "big moment" of the concierge. Given the person's
// instrument, what inspired them and the first song they dream of playing, it
// writes a warm, personal reaction that proves Musicphonetics understands them.
//
// GUARDRAIL: it must NOT state specific chords, notes, tabs or "facts" about the
// song (those are the teacher's job and must be real). It speaks about the
// JOURNEY — why the song is a great goal and how we'll get them there. Always
// returns something (AI, or a graceful template) so the flow never stalls.

import { json, rateLimited, callAI } from "./_shared.js";

const SYSTEM = `You are a warm, expert music mentor at Musicphonetics welcoming a brand-new
learner. You are given their instrument, what inspired them, their level and the first
song they dream of playing.

HARD RULES:
- NEVER state the song's chords, notes, tabs, key or any technical "fact" about it — that
  is the teacher's job and must be verified by a human. Speak about the JOURNEY only.
- Be specific to THEIR song and inspiration by NAME. Warm, encouraging Indian-English.
- Make them feel understood, not sold to. No prices, no hard sell.

OUTPUT EXACTLY these three labelled lines and nothing else:
ACK: <one sentence reacting to their inspiration + instrument choice>
MESSAGE: <2-3 sentences: why their first song is a wonderful goal and the reassuring idea that they don't need to learn everything before they start playing it>
FOCUS: <one short sentence naming the single most exciting thing we'll build first>`;

function template({ instrument, inspiration, song }) {
  const inst = (instrument || "music").toLowerCase();
  const ack = inspiration
    ? `${inspiration} is a beautiful inspiration — we'll shape your ${inst} around the music you actually love.`
    : `Wonderful — we'll shape your ${inst} around the music you actually love.`;
  const message = song
    ? `“${song}” is a fantastic first goal. Here's the good news: you don't need to learn everything before you can start playing it — we break it into a few core skills and get you into the song early, one satisfying piece at a time.`
    : `Here's the good news: you don't need to learn everything before you start playing the music you love — we build a few core skills and get you into real songs early.`;
  return { ack, message, focus: "First, we'll get a clean, confident sound and a steady rhythm under your fingers." };
}

function line(text, label) {
  const m = text.match(new RegExp(`${label}:\\s*(.+)`, "i"));
  return m ? m[1].trim() : "";
}

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "anon";
  if (rateLimited(`journey:${ip}`, 30, 60_000)) return json({ error: "Please wait a moment." }, 429);

  let b;
  try { b = await request.json(); } catch { return json({ error: "Bad request." }, 400); }
  const instrument = String(b.instrument || "").slice(0, 40);
  const inspiration = String(b.inspiration || "").slice(0, 80);
  const song = String(b.song || "").slice(0, 120);
  const level = String(b.level || "").slice(0, 40);
  const motivation = String(b.motivation || "").slice(0, 40);

  const fb = template({ instrument, inspiration, song });

  const user = [
    `Instrument: ${instrument || "not chosen yet"}.`,
    inspiration ? `Inspired by: ${inspiration}.` : "",
    motivation ? `Motivation: ${motivation}.` : "",
    level ? `Level: ${level}.` : "",
    song ? `First song they dream of playing: ${song}.` : "",
    "Write the ACK, MESSAGE and FOCUS lines now.",
  ].filter(Boolean).join("\n");

  const res = await callAI(env, { system: SYSTEM, user, temperature: 0.7, maxTokens: 320 });
  if (res.error || !res.text) return json({ ok: true, ...fb, fallback: true });

  const ack = line(res.text, "ACK") || fb.ack;
  const message = line(res.text, "MESSAGE") || fb.message;
  const focus = line(res.text, "FOCUS") || fb.focus;
  return json({ ok: true, ack, message, focus });
}
