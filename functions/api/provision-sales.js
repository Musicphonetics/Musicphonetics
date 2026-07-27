// POST /api/provision-sales  (OWNER ONLY)
// Creates a sales/marketing staff login with role='sales'. They get lead-only
// access (enforced by RLS via mp_is_sales); NOT owner. Returns a one-time
// temporary password for the owner to share; best-effort emails it too.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. RESEND_API_KEY/MAIL_FROM optional.
// Auth: Authorization: Bearer <owner access token>.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

function tempPassword() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ", b = "abcdefghijkmnpqrstuvwxyz", d = "23456789", s = "!@#$%";
  const pick = (set, n) => Array.from({ length: n }, () => set[Math.floor(Math.random() * set.length)]).join("");
  return pick(a, 2) + pick(b, 4) + pick(d, 3) + pick(s, 1);
}

async function assertOwner(env, token) {
  if (!token) return { ok: false, status: 401, error: "Sign in required" };
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` } });
  if (!uRes.ok) return { ok: false, status: 401, error: "Session expired" };
  const user = await uRes.json();
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`, { headers: admin(env) });
  const rows = pRes.ok ? await pRes.json() : [];
  if (rows[0]?.role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  return { ok: true, user };
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Server not configured" }, 503);
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const guard = await assertOwner(env, token);
  if (!guard.ok) return json({ ok: false, error: guard.error }, guard.status);

  let body;
  try { body = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const full_name = String(body.full_name || "").trim().slice(0, 120);
  const email = String(body.email || "").trim().toLowerCase().slice(0, 160);
  const role = ["sales", "sales_manager", "marketing"].includes(body.role) ? body.role : "sales";
  if (full_name.length < 2) return json({ ok: false, error: "Enter the person's name." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "Enter a valid email." }, 400);

  const password = tempPassword();
  const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST", headers: admin(env),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { full_name, role } }),
  });
  const created = await cRes.json().catch(() => ({}));
  if (!cRes.ok) {
    const msg = created.msg || created.error_description || created.error || "";
    if (/registered|exists|already/i.test(msg)) return json({ ok: false, error: "This email already has a login." }, 409);
    return json({ ok: false, error: "Could not create the login." }, 400);
  }
  const uid = created.id || created.user?.id;

  // Set the profile role = sales (upsert; the profile row may be auto-created).
  await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${uid}`, {
    method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ full_name, role, email }),
  }).catch(() => {});
  // Belt & suspenders: if PATCH matched no row, insert it.
  await fetch(`${env.SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST", headers: { ...admin(env), Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: uid, full_name, role, email }),
  }).catch(() => {});

  // Best-effort welcome email with the login + workspace URL.
  let emailed = false;
  if (env.RESEND_API_KEY) {
    try {
      const origin = new URL(request.url).origin;
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: env.MAIL_FROM || "Musicphonetics <onboarding@resend.dev>",
          to: [email], subject: "Your Musicphonetics Sales Workspace access",
          html: `<p>Hi ${full_name},</p><p>Your Musicphonetics sales workspace is ready.</p>
                 <p><b>Login:</b> ${email}<br><b>Temporary password:</b> ${password}</p>
                 <p>Sign in at <a href="${origin}/sales/login">${origin}/sales/login</a> and change your password.</p>`,
        }),
      });
      emailed = r.ok;
    } catch { /* best-effort */ }
  }

  return json({ ok: true, user_id: uid, login_email: email, temp_password: password, role, emailed });
}
