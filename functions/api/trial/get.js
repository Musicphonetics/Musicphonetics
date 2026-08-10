// GET /api/trial/get?token=<token>  (PUBLIC — the token is the secret)
// Returns a Trial Studio session so a returning visitor lands straight back in
// their studio (roadmap, songs, guitar reco, director note, teacher summary).
import { json, configured, callRpc, isToken } from "../_trial.js";

export async function onRequestGet({ request, env }) {
  if (!configured(env)) return json({ ok: false, error: "Server not configured." }, 503);
  const url = new URL(request.url);
  const token = url.searchParams.get("token");
  if (!isToken(token)) return json({ ok: false, error: "Invalid session." }, 400);

  try {
    const row = await callRpc(env, "mp_trial_get", { p_token: token });
    if (!row) return json({ ok: false, error: "Studio not found." }, 404);
    return json({ ok: true, session: row });
  } catch {
    return json({ ok: false, error: "Could not load your studio." }, 502);
  }
}
