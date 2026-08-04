// POST /api/send-offer  (OWNER ONLY)
// Emails a teacher applicant one of their onboarding documents:
//   doc = "offer"   → the Offer letter, with an "Accept my offer" button.
//   doc = "joining" → the full Joining Agreement + portal login (fresh temp password).
// Body: { application_id, doc, email? }  (email overrides the stored address)
//
// Records offer_sent_at / joining_sent_at on the application. For "joining" it
// requires a login to exist (teacher_id); it resets the password so the delivered
// one is always valid. Auth: Bearer <owner access token>.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, BREVO_API_KEY | RESEND_API_KEY,
//      MAIL_FROM, SITE_URL (optional; defaults to the pages.dev host).

import { sendEmail } from "./_mailer.js";
import { offerEmailHtml, joiningEmailHtml } from "./_letters.js";

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const admin = (env) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" });

function tempPassword() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ", num = "23456789", low = "abcdefghijkmnpqrstuvwxyz";
  const pick = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `Mp-${pick(abc, 2)}${pick(low, 3)}${pick(num, 3)}`;
}

async function assertOwner(env, token) {
  if (!token) return { ok: false, status: 401, error: "Missing session" };
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY } });
  if (!uRes.ok) return { ok: false, status: 401, error: "Invalid session" };
  const user = await uRes.json();
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`, { headers: admin(env) });
  const rows = pRes.ok ? await pRes.json() : [];
  if (rows[0]?.role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  return { ok: true, user };
}

async function audit(env, entry) {
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/audit_logs`, {
      method: "POST", headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({ ...entry, source: "server" }),
    });
  } catch { /* best-effort */ }
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Server not configured" }, 503);

  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const guard = await assertOwner(env, token);
  if (!guard.ok) return json({ ok: false, error: guard.error }, guard.status);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const appId = String(body.application_id || "");
  const doc = body.doc === "joining" ? "joining" : "offer";
  const overrideEmail = String(body.email || "").trim();
  if (!appId) return json({ ok: false, error: "application_id is required" }, 400);

  // Load the application.
  const aRes = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}&select=*`, { headers: admin(env) });
  const apps = aRes.ok ? await aRes.json() : [];
  const app = apps[0];
  if (!app) return json({ ok: false, error: "Application not found" }, 404);

  const to = overrideEmail || app.email;
  if (!to || !/.+@.+\..+/.test(to)) return json({ ok: false, error: "A valid recipient email is required." }, 400);

  const site = (env.SITE_URL || "https://musicphonetics.pages.dev").replace(/\/$/, "");
  const portal = `${site}/teacher/login`;

  // If the owner corrected the address, persist it so acceptance & later steps line up.
  const patch = {};
  if (overrideEmail && overrideEmail !== app.email) patch.email = overrideEmail;

  let html, subject, password = null;

  if (doc === "offer") {
    const acceptUrl = `${site}/api/accept-offer?token=${encodeURIComponent(app.accept_token || "")}`;
    if (!app.accept_token) return json({ ok: false, error: "This application has no accept token. Run supabase/teacher_onboarding_flow.sql." }, 409);
    html = offerEmailHtml({ name: app.full_name, acceptUrl });
    subject = "Your Musicphonetics teaching offer";
    patch.offer_sent_at = new Date().toISOString();
  } else {
    // Joining requires a login to exist so we can deliver valid credentials.
    if (!app.teacher_id) return json({ ok: false, error: "Approve the teacher first to create their login, then send the joining agreement." }, 409);
    // Reset the password so the delivered one is always valid.
    password = tempPassword();
    const rRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${app.teacher_id}`, {
      method: "PUT", headers: admin(env), body: JSON.stringify({ password }),
    });
    if (!rRes.ok) { password = null; } // fall back to sending without a fresh password
    html = joiningEmailHtml({ name: app.full_name, email: to, password, portal });
    subject = "Your Musicphonetics Joining Agreement & portal login";
    patch.joining_sent_at = new Date().toISOString();
  }

  const mail = await sendEmail(env, { to, subject, html });
  if (!mail.sent) return json({ ok: false, error: `Could not send the email: ${mail.note}` }, 502);

  await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}`, {
    method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" }, body: JSON.stringify(patch),
  }).catch(() => {});

  await audit(env, {
    actor_id: guard.user?.id ?? null, actor_role: "owner",
    action: doc === "offer" ? "teacher_offer_sent" : "teacher_joining_sent",
    entity_type: "teacher", entity_id: app.teacher_id || null, teacher_id: app.teacher_id || null,
    summary: `${doc === "offer" ? "Offer letter" : "Joining agreement"} emailed to ${to}`,
  });

  return json({ ok: true, doc, to, note: mail.note, ...(password ? { temp_password: password } : {}) });
}
