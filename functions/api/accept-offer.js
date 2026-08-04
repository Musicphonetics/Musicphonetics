// GET /api/accept-offer?token=<accept_token>   (PUBLIC — token is the secret)
// The teacher clicks "Accept my offer" in their offer email. We match the token
// to a teacher_applications row, stamp offer_accepted_at (idempotent), notify the
// owner, and return a friendly confirmation page. No login required.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY | RESEND_API_KEY (optional notify).

import { sendEmail } from "./_mailer.js";
import { acceptConfirmPage } from "./_letters.js";

const admin = (env) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" });
const page = (html) => new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return page(acceptConfirmPage({ name: "", alreadyAccepted: false }).replace("Offer accepted", "Link problem").replace(/We've recorded[^<]*/, "This acceptance link is invalid or has expired. Please contact us."));
  }

  const q = `accept_token=eq.${encodeURIComponent(token)}&select=id,full_name,email,offer_accepted_at&limit=1`;
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?${q}`, { headers: admin(env) });
  const rows = res.ok ? await res.json() : [];
  const app = rows[0];
  if (!app) {
    return page(acceptConfirmPage({ name: "", alreadyAccepted: false }).replace("Offer accepted", "Link problem").replace(/We've recorded[^<]*/, "This acceptance link is invalid or has expired. Please contact us."));
  }

  const already = !!app.offer_accepted_at;
  if (!already) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${app.id}`, {
      method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({ offer_accepted_at: new Date().toISOString() }),
    }).catch(() => {});

    // Best-effort: tell the owner the offer was accepted.
    sendEmail(env, {
      to: "guitaristabhishek07@gmail.com",
      subject: `Offer accepted — ${app.full_name}`,
      html: `<div style="font-family:Arial,sans-serif;color:#161b26"><p><b>${app.full_name}</b> (${app.email}) has just <b>accepted their teaching offer</b>.</p><p>Next: open the application in your owner portal and send the Joining Agreement + portal login.</p></div>`,
    }).catch(() => {});
  }

  return page(acceptConfirmPage({ name: app.full_name, alreadyAccepted: already }));
}
