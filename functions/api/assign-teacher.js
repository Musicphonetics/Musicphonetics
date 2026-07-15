// POST /api/assign-teacher  (OWNER ONLY)
// Assigns a student to a teacher by setting students.teacher_id. Once set, the
// student appears in that teacher's portal and their class notes flow to the
// parent. Pass teacher_id: null to unassign.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Auth: Authorization: Bearer <owner access token>, role must be 'owner'.

const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

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

  let b; try { b = await request.json(); } catch { return json({ ok: false, error: "Bad request" }, 400); }
  const studentId = String(b.student_id || "");
  const teacherId = b.teacher_id ? String(b.teacher_id) : null;
  if (!studentId) return json({ ok: false, error: "student_id is required" }, 400);

  // If assigning (not clearing), make sure the target is really a teacher.
  if (teacherId) {
    const tRes = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${teacherId}&select=role,full_name`, { headers: admin(env) });
    const tRows = tRes.ok ? await tRes.json() : [];
    if (tRows[0]?.role !== "teacher") return json({ ok: false, error: "That account is not a teacher." }, 400);
  }

  const uRes = await fetch(`${env.SUPABASE_URL}/rest/v1/students?id=eq.${studentId}`, {
    method: "PATCH",
    headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ teacher_id: teacherId }),
  });
  if (!uRes.ok) {
    const detail = await uRes.text().catch(() => `HTTP ${uRes.status}`);
    return json({ ok: false, error: `Could not assign the teacher (${detail.slice(0, 120)}).` }, 400);
  }
  await audit(env, {
    actor_id: guard.user?.id ?? null, actor_role: "owner",
    action: teacherId ? "teacher_assigned" : "teacher_changed",
    entity_type: "student", entity_id: studentId, student_id: studentId, teacher_id: teacherId,
    summary: teacherId ? "Assigned a teacher to a student" : "Unassigned the student's teacher",
  });
  return json({ ok: true });
}
