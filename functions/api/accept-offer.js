// GET /api/accept-offer?token=<accept_token>   (PUBLIC — token is the secret)
// The teacher taps "I accept & agree" in their offer email. In one motion we:
//   1) stamp offer_accepted_at (idempotent),
//   2) auto-provision their login (create/reuse + fill profile + mark approved),
//   3) email them the Joining Agreement + portal login + a fresh temporary password,
//   4) notify the owner.
// Then we return a friendly confirmation page. No teacher login required to accept.
//
// The token is the capability: it only ever provisions the email on THIS
// application, which the owner already vetted by choosing to send the offer.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY | RESEND_API_KEY,
//      MAIL_FROM, SITE_URL (optional).

import { sendEmail } from "./_mailer.js";
import { joiningEmailHtml, acceptConfirmPage } from "./_letters.js";
import { provisionFromApplication } from "./_provision.js";

const admin = (env) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" });
const page = (html) => new Response(html, { status: 200, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });

function problemPage() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Link problem · Musicphonetics</title></head>
  <body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#161b26">
    <div style="max-width:520px;margin:0 auto;padding:48px 20px;text-align:center">
      <div style="background:#161b26;border-radius:16px;padding:28px 24px;color:#fff">
        <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:.5px">MUSICPHONETICS</p>
        <h1 style="margin:18px 0 6px;font-size:22px">Link problem</h1>
        <p style="margin:0;font-size:15px;color:#d8d4c8;line-height:1.6">This acceptance link is invalid or has expired. Please contact us on WhatsApp +91 87961 99188 and we'll help you straight away.</p>
      </div>
    </div>
  </body></html>`;
}

export async function onRequestGet({ request, env }) {
  const token = new URL(request.url).searchParams.get("token") || "";
  if (!token || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return page(problemPage());

  const q = `accept_token=eq.${encodeURIComponent(token)}&select=*&limit=1`;
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?${q}`, { headers: admin(env) });
  const rows = res.ok ? await res.json() : [];
  const app = rows[0];
  if (!app) return page(problemPage());

  const already = !!app.offer_accepted_at;
  if (already) return page(acceptConfirmPage({ name: app.full_name, alreadyAccepted: true }));

  // 1) Record acceptance.
  await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${app.id}`, {
    method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ offer_accepted_at: new Date().toISOString() }),
  }).catch(() => {});

  // 2) Auto-provision the login (create/reuse) + fill profile + mark approved.
  const prov = await provisionFromApplication(env, app);

  // 3) Email the joining agreement + portal login + fresh password.
  const site = (env.SITE_URL || "https://musicphonetics.pages.dev").replace(/\/$/, "");
  const portal = `${site}/teacher/login`;
  if (prov.ok) {
    await sendEmail(env, {
      to: app.email,
      subject: "Welcome aboard — your Joining Agreement & portal login",
      html: joiningEmailHtml({ name: app.full_name, email: app.email, password: prov.password, portal }),
    }).catch(() => {});
    await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${app.id}`, {
      method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({ joining_sent_at: new Date().toISOString() }),
    }).catch(() => {});
  }

  // 4) Tell the owner.
  sendEmail(env, {
    to: "guitaristabhishek07@gmail.com",
    subject: `Offer accepted — ${app.full_name}`,
    html: `<div style="font-family:Arial,sans-serif;color:#161b26"><p><b>${app.full_name}</b> (${app.email}) has <b>accepted their teaching offer</b>.</p>`
      + (prov.ok
        ? `<p>Their login has been created and the Joining Agreement + temporary password emailed to them automatically. You can now assign leads from the owner portal.</p></div>`
        : `<p>Note: their login could not be auto-created (${prov.error || "unknown error"}). Open the application in your owner portal and finish the setup manually.</p></div>`),
  }).catch(() => {});

  return page(acceptConfirmPage({ name: app.full_name, alreadyAccepted: false }));
}
