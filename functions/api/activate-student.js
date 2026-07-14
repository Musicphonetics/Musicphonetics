// POST /api/activate-student  (PUBLIC, gated by a shared access code)
// A Director's-package student activates their own portal login. Creates a
// Supabase auth account (role: parent) with an easy password and returns the
// login id + password to show once on screen. No student row is created here;
// the office links the student record to this login from the owner dashboard.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ACTIVATION_CODE
// The ACTIVATION_CODE is the secret you share with your batch. Without it set,
// activation is closed (fails safe).

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

// A friendly, easy-to-type password: a music word + four digits, e.g. guitar-4821.
function easyPassword() {
  const words = ["music", "piano", "guitar", "rhythm", "melody", "chord", "tempo", "stage", "tune", "note"];
  const w = words[Math.floor(Math.random() * words.length)];
  const n = Math.floor(1000 + Math.random() * 9000);
  return `${w}-${n}`;
}

async function findUserByEmail(env, email) {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?per_page=200`, { headers: admin(env) });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const users = data.users || data || [];
  return users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Server not configured." }, 503);
  if (!env.ACTIVATION_CODE) return json({ ok: false, error: "Activation is not open yet." }, 503);

  let b; try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request." }, 400); }

  const code = String(b.code || "").trim();
  if (code !== String(env.ACTIVATION_CODE).trim()) return json({ ok: false, error: "That access code is not right. Please check with the office." }, 403);

  if (!b.agreed_terms) return json({ ok: false, error: "Please read and accept the Enrolment Agreement to continue." }, 400);
  const agreedAt = new Date().toISOString();

  const name = String(b.name || "").trim();
  const parent = String(b.parent || "").trim();
  const instrument = String(b.instrument || "").trim();
  const phone = String(b.phone || "").replace(/[^\d]/g, "");
  let email = String(b.email || "").trim().toLowerCase();

  if (name.length < 2) return json({ ok: false, error: "Please enter the student's name." }, 400);
  if (phone.length < 8) return json({ ok: false, error: "Please enter a valid WhatsApp number." }, 400);
  // If they have no email, build a stable login id from the number so activation
  // always works. It is a valid login id, just not a mailbox.
  if (!email) email = `s${phone}@students.musicphonetics.com`;
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "Please enter a valid email." }, 400);

  const existing = await findUserByEmail(env, email);
  if (existing) return json({ ok: false, error: "You already have a login for this. Please sign in, or reset your password from the login page." }, 409);

  const password = easyPassword();
  const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: admin(env),
    body: JSON.stringify({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: "parent", full_name: name, parent_name: parent, phone, instrument, package: "directors", activated_at: agreedAt, agreed_terms: true, agreed_terms_at: agreedAt },
    }),
  });
  const created = await cRes.json().catch(() => ({}));
  if (!cRes.ok) {
    const detail = created.msg || created.message || created.error_description || created.error || `HTTP ${cRes.status}`;
    return json({ ok: false, error: `Could not create your login (${detail}).` }, 400);
  }
  const id = created.id || created.user?.id;

  // Type this account as a parent so it is never treated as staff (some projects
  // auto-create a 'teacher' profile row on signup). Best-effort.
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
      method: "POST",
      headers: { ...admin(env), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id, role: "parent" }),
    });
  } catch { /* login already created; linking role is best-effort */ }

  // Create the child's student record and link it to this parent, so the parent
  // sees a profile straight away (not a dead-end) for the office to fill in.
  // teacher_id is required, so we use DIRECTOR_TEACHER_ID if set, else the owner.
  let studentLinked = false;
  try {
    let teacherId = String(env.DIRECTOR_TEACHER_ID || "").trim();
    if (!teacherId) {
      const oRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?role=eq.owner&select=id&limit=1`, { headers: admin(env) });
      const oRows = oRes.ok ? await oRes.json() : [];
      teacherId = oRows[0]?.id || "";
    }
    if (teacherId) {
      const providedEmail = /^\S+@\S+\.\S+$/.test(String(b.email || "").trim()) ? String(b.email || "").trim().toLowerCase() : null;
      const sRes = await fetch(`${env.SUPABASE_URL}/rest/v1/students`, {
        method: "POST",
        headers: { ...admin(env), Prefer: "return=minimal" },
        body: JSON.stringify({
          teacher_id: teacherId,
          parent_id: id,
          name,
          parent_name: parent || null,
          parent_phone: phone || null,
          parent_email: providedEmail,
          instrument: instrument || null,
          status: "active",
          classes_per_month: 8,
        }),
      });
      studentLinked = sRes.ok;
    }
  } catch { /* login is created; the office can link the student manually */ }

  return json({ ok: true, login_id: email, password, student_linked: studentLinked });
}
