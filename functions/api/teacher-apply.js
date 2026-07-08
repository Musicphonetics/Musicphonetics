// POST /api/teacher-apply  (PUBLIC - from the Teach With Us form)
// Creates a Supabase auth login for a new teacher and writes their details into
// the existing `profiles` table (role='teacher'). Uses the SERVICE ROLE key,
// server-side only. Returns the login email + a temporary password so the
// joining letter can show the teacher their credentials.
//
// Required env (Cloudflare Pages → Settings → Environment variables):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// NOTE: this endpoint is public. It only ever creates role='teacher' accounts
// and never returns anything about existing users. The owner can deactivate any
// teacher from the owner dashboard. Consider adding a CAPTCHA if abused.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

// Readable, strong temporary password (no ambiguous chars).
function tempPassword() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const num = "23456789";
  const low = "abcdefghijkmnpqrstuvwxyz";
  const pick = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `Mp-${pick(abc, 2)}${pick(low, 3)}${pick(num, 3)}`;
}

const clean = (v, n = 200) => String(v ?? "").trim().slice(0, n);

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return json({ ok: false, error: "Server not configured" }, 503);
  }

  let b;
  try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  const full_name = clean(b.full_name, 120);
  const email = clean(b.email, 160).toLowerCase();
  const phone = clean(b.phone, 20);

  if (full_name.length < 2) return json({ ok: false, error: "Full name is required." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "A valid email is required." }, 400);
  // The letter/agreement must be acknowledged before an account is created.
  if (!b.agreed) return json({ ok: false, error: "Please accept the engagement terms." }, 400);

  const password = tempPassword();

  // 1) Create the auth user. handle_new_user() creates the profile row; role
  //    comes from user_metadata.
  const createRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: admin(env),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name, role: "teacher" },
    }),
  });
  const created = await createRes.json().catch(() => ({}));
  if (!createRes.ok) {
    const msg = created.msg || created.error_description || created.error || "";
    if (/registered|exists|already/i.test(msg)) {
      return json({ ok: false, error: "This email is already registered. Please log in, or use a different email." }, 409);
    }
    return json({ ok: false, error: "Could not create your login. Please try again." }, 400);
  }
  const teacherId = created.id || created.user?.id;

  // 2) Build a single bank/payout string for the existing `bank_upi` column.
  const bankParts = [
    b.bank_holder && `A/C name: ${clean(b.bank_holder, 120)}`,
    b.bank_name && `Bank: ${clean(b.bank_name, 120)}`,
    b.bank_account && `A/C: ${clean(b.bank_account, 40)}`,
    b.bank_ifsc && `IFSC: ${clean(b.bank_ifsc, 20).toUpperCase()}`,
    b.bank_upi && `UPI: ${clean(b.bank_upi, 80)}`,
  ].filter(Boolean);

  // 3) Extend the profile with the application details (best-effort).
  if (teacherId) {
    const patch = {
      full_name,
      role: "teacher",
      phone: phone || null,
      email,
      instruments: Array.isArray(b.instruments) ? b.instruments.slice(0, 20) : null,
      regions: Array.isArray(b.regions) ? b.regions.slice(0, 20) : null,
      preferred_modes: Array.isArray(b.modes) ? b.modes.slice(0, 10) : null,
      experience_years: Number.isFinite(Number(b.experience_years)) ? Number(b.experience_years) : null,
      qualifications: clean(b.qualifications, 300) || null,
      bank_upi: bankParts.join(" · ") || null,
    };
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${teacherId}`, {
      method: "PATCH",
      headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify(patch),
    }).catch(() => {});
  }

  return json({ ok: true, teacher_id: teacherId, login_email: email, temp_password: password });
}
