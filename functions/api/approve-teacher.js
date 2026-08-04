// POST /api/approve-teacher  (OWNER ONLY)
// The owner reviews a teacher_applications row and approves it here. Only then
// is a Supabase login created and the profile filled from the application.
// Returns the login email + a temporary password for the owner to share, and
// the application data so the owner can print the Offer Letter.
//
// Approval creates the login only; it does NOT email the teacher. Onboarding
// documents are sent from the staged flow (POST /api/send-offer): the owner sends
// the Offer letter → the teacher accepts → the owner sends the Joining agreement
// + login. This keeps offer and joining as deliberate, separate steps.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// Auth: Authorization: Bearer <owner access token>. Caller must be role='owner'.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

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
  const uRes = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${token}`, apikey: env.SUPABASE_SERVICE_ROLE_KEY },
  });
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
  if (!appId) return json({ ok: false, error: "application_id is required" }, 400);

  // 1) Load the application.
  const aRes = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}&select=*`, { headers: admin(env) });
  const apps = aRes.ok ? await aRes.json() : [];
  const app = apps[0];
  if (!app) return json({ ok: false, error: "Application not found" }, 404);
  if (app.status === "approved") return json({ ok: false, error: "Already approved" }, 409);

  const password = tempPassword();

  // 2) Create the auth login.
  const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: admin(env),
    body: JSON.stringify({
      email: app.email, password, email_confirm: true,
      user_metadata: { full_name: app.full_name, role: "teacher" },
    }),
  });
  const created = await cRes.json().catch(() => ({}));
  if (!cRes.ok) {
    const msg = created.msg || created.error_description || created.error || "";
    if (/registered|exists|already/i.test(msg)) return json({ ok: false, error: "This email already has a login." }, 409);
    return json({ ok: false, error: "Could not create the login." }, 400);
  }
  const teacherId = created.id || created.user?.id;

  // 3) One source of truth: fill the teacher's PROFILE from the application so
  // they never re-enter what they already gave. Everything here reads from the
  // stored application record; the joining letter is an OUTPUT of this data, not
  // its source. Idempotent — PATCH/upsert by id, safe if approval is re-run.
  if (teacherId) {
    const instruments = Array.isArray(app.instruments) ? app.instruments.filter(Boolean) : [];
    const areas = Array.isArray(app.areas) ? app.areas.filter(Boolean) : [];
    const modes = Array.isArray(app.modes) ? app.modes.filter(Boolean) : [];
    const yrs = parseInt(String(app.years_teaching ?? "").replace(/[^\d]/g, ""), 10);
    const acct = String(app.bank_account ?? "").replace(/\s+/g, "");
    const dob = /^\d{4}-\d{2}-\d{2}$/.test(String(app.dob ?? "")) ? app.dob : null;

    // 3a) Public profile fields.
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${teacherId}`, {
      method: "PATCH",
      headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({
        full_name: app.full_name, legal_name: app.full_name, role: "teacher",
        email: app.email, phone: app.phone || null,
        dob, city: app.city || null, address_line_1: app.address || null,
        languages: app.languages || null,
        instruments: instruments.length ? instruments : null,
        primary_instrument: instruments[0] || null,
        regions: areas.length ? areas : null,
        preferred_modes: modes.length ? modes : null,
        experience_years: Number.isFinite(yrs) ? yrs : null,
        qualifications: app.qualification || null,
        certifications: app.grade || null,
        bank_account_holder: app.bank_holder || null,
        bank_name: app.bank_name || null,
        bank_account_last4: acct ? acct.slice(-4) : null,
        ifsc: app.bank_ifsc || null,
        upi_id: app.bank_upi || null,
      }),
    }).catch(() => {});

    // 3b) Sensitive details (full account number) → private table (upsert).
    if (acct) {
      await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_private_details`, {
        method: "POST",
        headers: { ...admin(env), Prefer: "resolution=merge-duplicates,return=minimal" },
        body: JSON.stringify({ teacher_id: teacherId, bank_account_number: acct }),
      }).catch(() => {});
    }

    // 3c) Seed weekly availability from the application's days × time bands, but
    // only if none exists yet (so re-runs never duplicate). Times are sensible
    // defaults the teacher can adjust — they just don't start from scratch.
    try {
      const existing = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_availability?teacher_id=eq.${teacherId}&select=id&limit=1`, { headers: admin(env) });
      const has = existing.ok ? await existing.json() : [];
      const days = Array.isArray(app.days) ? app.days : [];
      const bands = Array.isArray(app.time_bands) ? app.time_bands : [];
      if ((!has || has.length === 0) && days.length) {
        const DAY = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
        const BAND = { morning: ["09:00", "12:00"], afternoon: ["12:00", "16:00"], evening: ["16:00", "20:00"], night: ["18:00", "21:00"] };
        const bandRanges = (bands.length ? bands : ["evening"]).map((b) => BAND[String(b).toLowerCase().slice(0, 9)] || BAND[String(b).toLowerCase().slice(0, 3) === "aft" ? "afternoon" : "evening"]).filter(Boolean);
        const rows = [];
        for (const d of days) {
          const wd = DAY[String(d).toLowerCase().slice(0, 3)];
          if (wd === undefined) continue;
          for (const [start, end] of bandRanges) rows.push({ teacher_id: teacherId, weekday: wd, start_time: start, end_time: end, active: true });
        }
        if (rows.length) {
          await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_availability`, {
            method: "POST", headers: { ...admin(env), Prefer: "return=minimal" },
            body: JSON.stringify(rows),
          }).catch(() => {});
        }
      }
    } catch { /* availability seed is best-effort */ }
  }

  // 3d) Derive the onboarding checklist now (from the freshly-filled profile) so
  // the teacher opens the portal to an accurate state and only completes the
  // genuinely-missing items (PAN, ID proof, photo, acknowledgements).
  if (teacherId) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/mp_sync_onboarding`, {
      method: "POST", headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({ p_teacher_id: teacherId }),
    }).catch(() => {});
  }

  // 4) Mark the application approved.
  await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}`, {
    method: "PATCH",
    headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ status: "approved", teacher_id: teacherId, approved_at: new Date().toISOString() }),
  }).catch(() => {});

  // 5) Audit (never include the password). No email here — the owner sends the
  //    offer and joining documents from the staged flow (/api/send-offer).
  await audit(env, {
    actor_id: guard.user?.id ?? null, actor_role: "owner",
    action: "teacher_application_approved", entity_type: "teacher", entity_id: teacherId, teacher_id: teacherId,
    summary: `Approved teacher application for ${app.full_name}`,
  });

  return json({
    ok: true,
    teacher_id: teacherId,
    login_email: app.email,
    temp_password: password,
  });
}
