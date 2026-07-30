// POST /api/link-child  (AUTHENTICATED parent) — adds another child to the
// SAME family login. The signed-in parent's access token identifies them; the
// new student row is created with parent_id = that user, so it appears under
// their existing login. The office then assigns a teacher, plan and fees.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY. Optional: DIRECTOR_TEACHER_ID.

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });

const HITS = new Map();
function rl(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1; return true;
}
const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

// Verify the caller's access token → their auth user id.
async function userFromToken(env, token) {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const u = await res.json().catch(() => null);
    return u && u.id ? u : null;
  } catch { return null; }
}

async function getProfile(env, id) {
  try {
    const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${id}&select=role,full_name`, { headers: admin(env) });
    const rows = res.ok ? await res.json() : [];
    return rows[0] ?? null;
  } catch { return null; }
}

export async function onRequestPost({ request, env }) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Server not configured." }, 503);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rl(`linkchild:${ip}`, 12, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  const authz = request.headers.get("authorization") || "";
  const token = authz.toLowerCase().startsWith("bearer ") ? authz.slice(7).trim() : "";
  if (!token) return json({ ok: false, error: "Please sign in again." }, 401);

  const user = await userFromToken(env, token);
  if (!user) return json({ ok: false, error: "Your session has expired. Please sign in again." }, 401);

  // Staff accounts must never create student rows under themselves.
  const profile = await getProfile(env, user.id);
  if (profile && (profile.role === "owner" || profile.role === "teacher")) {
    return json({ ok: false, error: "This is a staff account, not a family login." }, 403);
  }

  let b; try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request." }, 400); }
  const name = String(b?.name || "").trim();
  const instrument = String(b?.instrument || "").trim();
  const relation = String(b?.relation || "").trim();
  if (name.length < 2) return json({ ok: false, error: "Please enter the child's name." }, 400);

  // teacher_id is required on students; use the configured director/owner as a
  // placeholder for the office to reassign.
  let teacherId = String(env.DIRECTOR_TEACHER_ID || "").trim();
  if (!teacherId) {
    const oRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?role=eq.owner&select=id&limit=1`, { headers: admin(env) });
    const oRows = oRes.ok ? await oRes.json() : [];
    teacherId = oRows[0]?.id || "";
  }
  if (!teacherId) return json({ ok: false, error: "Couldn't add the child right now. Please contact the office." }, 500);

  const parentName = String(user.user_metadata?.parent_name || profile?.full_name || user.user_metadata?.full_name || "").trim() || null;
  const parentPhone = String(user.user_metadata?.phone || "").replace(/[^\d]/g, "") || null;
  const parentEmail = /^\S+@\S+\.\S+$/.test(user.email || "") && !/@students\.musicphonetics\.com$/i.test(user.email || "") ? user.email : null;

  const sRes = await fetch(`${env.SUPABASE_URL}/rest/v1/students`, {
    method: "POST",
    headers: { ...admin(env), Prefer: "return=representation" },
    body: JSON.stringify({
      teacher_id: teacherId,
      parent_id: user.id,
      name,
      parent_name: parentName,
      parent_phone: parentPhone,
      parent_email: parentEmail,
      instrument: instrument || null,
      status: "active",
      classes_per_month: 8,
      notes: relation ? `Family: ${relation}. Added by parent via portal — assign teacher, plan & fees.` : "Added by parent via portal — assign teacher, plan & fees.",
    }),
  });
  if (!sRes.ok) {
    const t = await sRes.text().catch(() => "");
    return json({ ok: false, error: "Couldn't add the child. Please try again." , detail: t.slice(0, 160) }, 502);
  }
  const created = await sRes.json().catch(() => []);
  const studentId = Array.isArray(created) ? created[0]?.id : created?.id;

  // Notify owners so they assign the teacher/plan/fees (→ email via trigger).
  try {
    const oRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?role=eq.owner&select=id`, { headers: admin(env) });
    const owners = oRes.ok ? await oRes.json() : [];
    if (owners.length) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/notifications`, {
        method: "POST",
        headers: { ...admin(env), Prefer: "return=minimal" },
        body: JSON.stringify(owners.map((o) => ({
          recipient_id: o.id, role: "owner", type: "new_lead",
          title: "Family added a child",
          body: `${name}${instrument ? ` · ${instrument}` : ""}${parentName ? ` · parent ${parentName}` : ""} — assign teacher, plan & fees.`,
          action_url: studentId ? `/owner/students` : "/owner/students",
          entity_type: "student", entity_id: studentId ? String(studentId) : null,
        }))),
      });
    }
  } catch { /* notification is best-effort */ }

  return json({ ok: true, student_id: studentId ?? null });
}
