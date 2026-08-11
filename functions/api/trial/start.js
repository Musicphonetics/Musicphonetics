// POST /api/trial/start  (PUBLIC)
// Books a trial the way the funnel demands: it provisions a REAL parent auth
// account (temp password), links a dedupe-aware CRM lead + a trial_sessions row,
// emails the credentials, and returns the temp password so the browser can sign
// the family straight into their Trial Portal. Email is required — a login needs
// one. On enrolment this same account becomes the Student Portal.
import { json, clean, configured, callRpc, rateLimit } from "../_trial.js";
import { sendEmail, mailerConfigured } from "../_mailer.js";

const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});
function tempPassword() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ", num = "23456789", low = "abcdefghijkmnpqrstuvwxyz";
  const pick = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `Mp-${pick(abc, 2)}${pick(low, 3)}${pick(num, 3)}`;
}
async function findUserByEmail(env, email) {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?per_page=200`, { headers: admin(env) });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const users = data.users || data || [];
  return users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}
async function roleOf(env, id) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=role`, { headers: admin(env) });
  const rows = r.ok ? await r.json() : [];
  return rows[0]?.role || null;
}
async function teaches(env, id) {
  const r = await fetch(`${env.SUPABASE_URL}/rest/v1/students?teacher_id=eq.${id}&select=id&limit=1`, { headers: admin(env) });
  const rows = r.ok ? await r.json() : [];
  return rows.length > 0;
}

function welcomeEmail({ studentName, email, password, portal }) {
  const who = studentName ? studentName : "your child";
  return `<!doctype html><html><body style="margin:0;background:#f4eee1;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#12100a">
  <div style="max-width:560px;margin:0 auto;padding:28px 22px">
    <div style="font-family:Georgia,serif;font-size:22px;font-weight:700">Musicphonetics</div>
    <div style="height:3px;width:54px;background:#c6a02e;margin:8px 0 22px"></div>
    <h1 style="font-family:Georgia,serif;font-size:26px;margin:0 0 6px">Your Trial Journey has started.</h1>
    <p style="font-size:15px;line-height:1.6;color:#3a3527">Welcome to Musicphonetics. We've opened a private <b>Trial Portal</b> for ${who}. Log in to complete your quick pre-assessment and follow every step — teacher assignment, your trial class, the director's review and your personal recommendation.</p>
    <div style="background:#fff;border:1px solid #e2d6ba;border-radius:12px;padding:18px 20px;margin:20px 0">
      <div style="font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#8a7c5c;font-weight:700">Your login</div>
      <p style="margin:10px 0 2px;font-size:15px"><b>Email:</b> ${email}</p>
      <p style="margin:0;font-size:15px"><b>Temporary password:</b> <span style="font-family:monospace;background:#f4eee1;padding:2px 8px;border-radius:6px">${password}</span></p>
    </div>
    <a href="${portal}" style="display:inline-block;background:#12100a;color:#f4eee1;text-decoration:none;padding:14px 28px;border-radius:999px;font-weight:700;font-size:15px">Enter my Trial Portal →</a>
    <p style="font-size:12px;color:#8a7c5c;margin-top:22px">You can change your password once inside. This portal becomes your full Student Portal when you enrol.</p>
  </div></body></html>`;
}

export async function onRequestPost({ request, env }) {
  if (!configured(env)) return json({ ok: false, error: "Server not configured." }, 503);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rateLimit(`trial:${ip}`, 20, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  const raw = await request.text();
  if (raw.length > 6000) return json({ ok: false, error: "Bad request" }, 400);
  let b; try { b = JSON.parse(raw); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  if (clean(b.botcheck, 50)) return json({ ok: true, token: null });

  const email = (clean(b.email, 160) || "").toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "A valid email is required to open your Trial Portal." }, 400);

  const studentName = clean(b.student_name, 120);
  const origin = new URL(request.url).origin;
  const portalUrl = `${origin}/trial/login`;

  // 1) Provision (or safely reuse) the parent auth account.
  let userId = null;
  const password = tempPassword();
  const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST", headers: admin(env),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { role: "parent", full_name: b.parent_name || studentName || "" } }),
  });
  const created = await cRes.json().catch(() => ({}));
  if (cRes.ok) {
    userId = created.id || created.user?.id;
  } else {
    const existing = await findUserByEmail(env, email);
    if (!existing) {
      const detail = created.msg || created.error_description || created.error || `HTTP ${cRes.status}`;
      return json({ ok: false, error: `Could not open your portal (${detail}).` }, 400);
    }
    // Never attach a trial to a staff account.
    const r = await roleOf(env, existing.id);
    if (r === "teacher" || r === "owner" || (await teaches(env, existing.id))) {
      return json({ ok: false, error: "That email belongs to a staff account. Please use a personal email." }, 409);
    }
    userId = existing.id;
    // Reset the password so the delivered one works.
    await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
      method: "PUT", headers: admin(env), body: JSON.stringify({ password }),
    }).catch(() => {});
  }
  if (!userId) return json({ ok: false, error: "Could not open your portal. Please try again." }, 502);

  // 2) Type the account as a parent (idempotent).
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
      method: "POST", headers: { ...admin(env), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: userId, role: "parent", full_name: b.parent_name || studentName || null, email }),
    });
  } catch { /* login already works */ }

  // 3) Create the lead + trial session, linked to the login.
  let token = null;
  try {
    const r = await callRpc(env, "mp_trial_start", {
      p: {
        user_id: userId, student_name: studentName, parent_name: clean(b.parent_name, 120),
        who: clean(b.who, 40), student_age: clean(b.student_age, 40), phone: clean(b.phone, 40), email,
        instrument: clean(b.instrument, 40) || "Guitar", preferred_mode: clean(b.preferred_mode, 40),
        preferred_area: clean(b.preferred_area, 120), experience_level: clean(b.experience_level, 120),
        learning_goal: clean(b.learning_goal, 300), source: "trial_portal", landing_page: "/studio",
        utm_source: clean(b.utm_source, 120), utm_medium: clean(b.utm_medium, 120), utm_campaign: clean(b.utm_campaign, 120),
        answers: (b.answers && typeof b.answers === "object") ? b.answers : {},
      },
    });
    token = r && r.token;
  } catch { /* account exists; portal can still load via mp_trial_mine */ }

  // 4) Email the credentials (best-effort — never blocks the response).
  if (mailerConfigured(env)) {
    try {
      await sendEmail(env, {
        to: email, subject: "Your Musicphonetics Trial Portal is ready",
        html: welcomeEmail({ studentName, email, password, portal: portalUrl }),
      });
    } catch { /* ignore */ }
  }

  return json({ ok: true, token, email, temp_password: password, portal: "/trial/dashboard" });
}
