// POST /api/email-test  (owner-gated)
// Sends a single test email so the owner can confirm the mail provider is wired
// up correctly, and see the provider's exact response if it isn't. This does NOT
// touch the outbox — it sends directly via the shared mailer, so it isolates
// "is a provider configured and accepting mail?" from "is the cron drainer
// running?". Body: { to?: string } (defaults to the owner's own account email).

import { json, assertOwner, bearer } from "../_shared/ops.js";
import { sendEmail, mailerConfigured, parseFrom } from "./_mailer.js";

async function handle({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Supabase not configured" }, 503);

  const gate = await assertOwner(env, bearer(request));
  if (!gate.ok) return json({ ok: false, error: gate.error }, gate.status || 403);

  if (!mailerConfigured(env)) {
    return json({ ok: false, sent: false, note: "No mail provider is configured. In Cloudflare Pages → Settings → Environment variables, add BREVO_API_KEY (recommended — no domain needed, just verify one sender in Brevo) or RESEND_API_KEY, plus MAIL_FROM." }, 200);
  }

  let to = "";
  try { to = (await request.json())?.to || ""; } catch { /* no body */ }
  to = (to || gate.user.email || "").trim();
  if (!to || !to.includes("@")) return json({ ok: false, sent: false, note: "No valid recipient. Add an email to your owner profile or pass one." }, 200);

  const from = parseFrom(env);
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;color:#161B26;max-width:520px;margin:auto">
    <h2 style="font-family:Georgia,serif">Test email ✓</h2>
    <p>If you're reading this, Musicphonetics can deliver email to <b>${to}</b>.</p>
    <p style="font-size:13px;color:#555">Sending as: ${from.name} &lt;${from.email}&gt;</p>
    <hr style="border:none;border-top:1px solid #eee;margin:20px 0">
    <p style="font-size:12px;color:#888">Sent from the owner portal email self-test.</p></div>`;

  const r = await sendEmail(env, { to, subject: "Musicphonetics email test", html });
  return json({ ok: r.sent, sent: r.sent, to, from: `${from.name} <${from.email}>`, note: r.note }, 200);
}

export const onRequestPost = handle;
