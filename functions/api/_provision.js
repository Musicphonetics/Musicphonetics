// Shared teacher provisioning from a teacher_applications row.
// Underscore-prefixed → importable, never routed.
//
// Creates (or reuses) the Supabase auth login, fills the profile from the
// application, stores private bank details, seeds availability, syncs the
// onboarding checklist, and marks the application approved. Idempotent and safe
// to run more than once. Returns { ok, teacherId, password, existed, error, status }.
//
// Used by BOTH:
//   - POST /api/approve-teacher  (owner clicks Approve)
//   - GET  /api/accept-offer     (teacher taps “I accept” → auto-provision)

const admin = (env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY,
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
  "content-type": "application/json",
});

export function tempPassword() {
  const abc = "ABCDEFGHJKLMNPQRSTUVWXYZ", num = "23456789", low = "abcdefghijkmnpqrstuvwxyz";
  const pick = (s, n) => Array.from({ length: n }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return `Mp-${pick(abc, 2)}${pick(low, 3)}${pick(num, 3)}`;
}

async function findTeacherIdByEmail(env, email) {
  try {
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?email=eq.${encodeURIComponent(email)}&select=id&limit=1`, { headers: admin(env) });
    const rows = r.ok ? await r.json() : [];
    return rows[0]?.id || null;
  } catch { return null; }
}

export async function provisionFromApplication(env, app) {
  const password = tempPassword();
  let teacherId = app.teacher_id || null;
  let existed = !!teacherId;

  // 1) Create the auth login (or locate + password-reset an existing one).
  if (!teacherId) {
    const cRes = await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users`, {
      method: "POST", headers: admin(env),
      body: JSON.stringify({ email: app.email, password, email_confirm: true, user_metadata: { full_name: app.full_name, role: "teacher" } }),
    });
    const created = await cRes.json().catch(() => ({}));
    if (cRes.ok) {
      teacherId = created.id || created.user?.id;
    } else {
      const msg = created.msg || created.error_description || created.error || "";
      if (/registered|exists|already/i.test(msg)) {
        teacherId = await findTeacherIdByEmail(env, app.email);
        existed = true;
        if (!teacherId) return { ok: false, error: "A login already exists for this email but could not be located.", status: 409 };
      } else {
        return { ok: false, error: "Could not create the login.", status: 400 };
      }
    }
  }

  // If the login already existed, reset its password so the delivered one is valid.
  if (existed && teacherId) {
    await fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${teacherId}`, {
      method: "PUT", headers: admin(env), body: JSON.stringify({ password }),
    }).catch(() => {});
  }

  if (!teacherId) return { ok: false, error: "Could not resolve the teacher login.", status: 400 };

  // 2) Fill the PROFILE from the application (single source of truth). Idempotent.
  const instruments = Array.isArray(app.instruments) ? app.instruments.filter(Boolean) : [];
  const areas = Array.isArray(app.areas) ? app.areas.filter(Boolean) : [];
  const modes = Array.isArray(app.modes) ? app.modes.filter(Boolean) : [];
  const yrs = parseInt(String(app.years_teaching ?? "").replace(/[^\d]/g, ""), 10);
  const acct = String(app.bank_account ?? "").replace(/\s+/g, "");
  const dob = /^\d{4}-\d{2}-\d{2}$/.test(String(app.dob ?? "")) ? app.dob : null;

  await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${teacherId}`, {
    method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
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

  // 3) Private bank details (full account number).
  if (acct) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_private_details`, {
      method: "POST", headers: { ...admin(env), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ teacher_id: teacherId, bank_account_number: acct }),
    }).catch(() => {});
  }

  // 4) Seed weekly availability (only if none exists yet).
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
          method: "POST", headers: { ...admin(env), Prefer: "return=minimal" }, body: JSON.stringify(rows),
        }).catch(() => {});
      }
    }
  } catch { /* best-effort */ }

  // 5) Derive the onboarding checklist from the freshly-filled profile.
  await fetch(`${env.SUPABASE_URL}/rest/v1/rpc/mp_sync_onboarding`, {
    method: "POST", headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ p_teacher_id: teacherId }),
  }).catch(() => {});

  // 6) Mark the application approved.
  await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${app.id}`, {
    method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ status: "approved", teacher_id: teacherId, approved_at: new Date().toISOString() }),
  }).catch(() => {});

  return { ok: true, teacherId, password, existed };
}
