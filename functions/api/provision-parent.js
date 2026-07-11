// POST /api/provision-parent  (OWNER ONLY)
// Creates a parent login (Supabase auth) and links it to a student by setting
// students.parent_id. If the email already has a login (e.g. a sibling's
// parent), it links the existing account instead of creating a duplicate.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Auth: Authorization: Bearer <owner access token>, role must be 'owner'.

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
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
async function assertOwner(env, token) {
  if (!token) return { ok: false, status: 401, error: "Missing session" };
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, { headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY } });
  if (!uRes.ok) return { ok: false, status: 401, error: "Invalid session" };
  const user = await uRes.json();
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`, { headers: admin(env) });
  const rows = pRes.ok ? await pRes.json() : [];
  if (rows[0]?.role !== "owner") return { ok: false, status: 403, error: "Owner access required" };
  return { ok: true };
}

async function findUserByEmail(env, email) {
  // GoTrue admin list; fine for an early-scale user base.
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users?per_page=200`, { headers: admin(env) });
  if (!res.ok) return null;
  const data = await res.json().catch(() => ({}));
  const users = data.users || data || [];
  return users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase()) || null;
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Server not configured" }, 503);
  const token = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  const guard = await assertOwner(env, token);
  if (!guard.ok) return json({ ok: false, error: guard.error }, guard.status);

  let b; try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const studentId = String(b.student_id || "");
  const email = String(b.email || "").trim().toLowerCase();
  if (!studentId) return json({ ok: false, error: "student_id is required" }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "A valid parent email is required" }, 400);

  let parentId = null;
  let tempPw = null;

  const password = tempPassword();
  const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST", headers: admin(env),
    body: JSON.stringify({ email, password, email_confirm: true, user_metadata: { role: "parent" } }),
  });
  const created = await cRes.json().catch(() => ({}));
  if (cRes.ok) {
    parentId = created.id || created.user?.id;
    tempPw = password;
  } else {
    // Create failed - most often the email already has a login. Try to find and
    // link it regardless of the exact error shape (GoTrue versions differ).
    const existing = await findUserByEmail(env, email);
    if (existing) {
      // Never attach a child to a staff account - it would let that account see
      // the teacher's/owner's data through the parent portal.
      const rRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${existing.id}&select=role`, { headers: admin(env) });
      const rRows = rRes.ok ? await rRes.json() : [];
      const existingRole = rRows[0]?.role;
      const teachesRes = await fetch(`${env.SUPABASE_URL}/rest/v1/students?teacher_id=eq.${existing.id}&select=id&limit=1`, { headers: admin(env) });
      const teaches = teachesRes.ok ? await teachesRes.json() : [];
      if (existingRole === "teacher" || existingRole === "owner" || teaches.length > 0) {
        return json({ ok: false, error: "That email belongs to a staff (teacher/owner) account. Use the parent's own email address." }, 409);
      }
      parentId = existing.id; // link existing (e.g. sibling's parent)
    } else {
      const detail = created.msg || created.message || created.error_description || created.error || created.error_code || `HTTP ${cRes.status}`;
      return json({ ok: false, error: `Could not create the parent login (${detail}).` }, 400);
    }
  }

  // Link the student to the parent.
  const pRes = await fetch(`${env.SUPABASE_URL}/rest/v1/students?id=eq.${studentId}`, {
    method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ parent_id: parentId }),
  });
  if (!pRes.ok) return json({ ok: false, error: "Login ready, but linking the student failed." }, 400);

  // Type this account as a parent so it's never treated as a teacher (many
  // Supabase projects auto-create a 'teacher' profile row on signup). Best-effort.
  try {
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?on_conflict=id`, {
      method: "POST",
      headers: { ...admin(env), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ id: parentId, role: "parent" }),
    });
  } catch { /* ignore - login + link already succeeded */ }

  return json({ ok: true, parent_id: parentId, login_email: email, temp_password: tempPw, linked_existing: !tempPw });
}
