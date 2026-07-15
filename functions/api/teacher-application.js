// POST /api/teacher-application  (PUBLIC - from the Teach With Us form)
// Records a teacher APPLICATION only. It does NOT create any login. The owner
// reviews the application in the owner portal and approves it there; only then
// is a login created (see /api/approve-teacher).
//
// It best-effort inserts into the `teacher_applications` table (run the SQL in
// supabase/teacher_applications.sql) AND emails the owner the full application,
// including bank details, so nothing is missed.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (both optional here - email is
// the fallback). WEB3FORMS_ACCESS_KEY optional (falls back to the public key).

const WEB3FORMS_FALLBACK = "1a5d9694-46b9-4236-8ced-1b68b65b5097";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const clean = (v, n = 300) => String(v ?? "").trim().slice(0, n);
const arr = (v) => (Array.isArray(v) ? v.map((x) => clean(x, 60)).slice(0, 30) : []);

// Tiny per-isolate rate limiter (abuse protection for a public endpoint).
const HITS = new Map();
function rl(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1; return true;
}

export async function onRequestPost({ request, env }) {
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rl(`apply:${ip}`, 8, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  const raw = await request.text();
  if (raw.length > 12000) return json({ ok: false, error: "Bad request" }, 400);
  let b;
  try { b = JSON.parse(raw); } catch { return json({ ok: false, error: "Bad request" }, 400); }

  const full_name = clean(b.full_name, 120);
  const email = clean(b.email, 160).toLowerCase();
  const phone = clean(b.phone, 20);

  if (full_name.length < 2) return json({ ok: false, error: "Full name is required." }, 400);
  if (!/^\S+@\S+\.\S+$/.test(email)) return json({ ok: false, error: "A valid email is required." }, 400);
  if (!b.agreed) return json({ ok: false, error: "Please accept the terms to submit." }, 400);

  const ref = "MP-APP-" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "-" + Math.floor(1000 + Math.random() * 9000);

  const row = {
    ref,
    full_name, email, phone,
    dob: clean(b.dob, 20) || null,
    gender: clean(b.gender, 30) || null,
    city: clean(b.city, 80) || null,
    address: clean(b.address, 300) || null,
    languages: clean(b.languages, 200) || null,
    instruments: arr(b.instruments),
    years_teaching: clean(b.years_teaching, 10) || null,
    years_performing: clean(b.years_performing, 10) || null,
    qualification: clean(b.qualification, 200) || null,
    grade: clean(b.grade, 60) || null,
    commitment: clean(b.commitment, 40) || null,
    days: arr(b.days),
    time_bands: arr(b.time_bands),
    modes: arr(b.modes),
    areas: arr(b.areas),
    transport: clean(b.transport, 10) || null,
    bank_holder: clean(b.bank_holder, 120) || null,
    bank_name: clean(b.bank_name, 120) || null,
    bank_account: clean(b.bank_account, 40) || null,
    bank_ifsc: clean(b.bank_ifsc, 20).toUpperCase() || null,
    bank_upi: clean(b.bank_upi, 80) || null,
    why_join: clean(b.why_join, 600) || null,
    status: "pending",
  };

  // 1) Best-effort store for the owner review screen.
  let stored = false;
  if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const res = await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications`, {
        method: "POST",
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "content-type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify(row),
      });
      stored = res.ok;
    } catch { /* fall through to email */ }
  }

  // 2) Notify the owner with the FULL application, including bank details.
  const bank = [
    row.bank_holder && `Holder: ${row.bank_holder}`,
    row.bank_name && `Bank: ${row.bank_name}`,
    row.bank_account && `A/C: ${row.bank_account}`,
    row.bank_ifsc && `IFSC: ${row.bank_ifsc}`,
    row.bank_upi && `UPI: ${row.bank_upi}`,
  ].filter(Boolean).join(" | ") || "-";

  try {
    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({
        access_key: env.WEB3FORMS_ACCESS_KEY || WEB3FORMS_FALLBACK,
        subject: `New Teacher Application - ${full_name} (${row.instruments.join(", ") || "-"})`,
        from_name: "Musicphonetics Applications",
        Reference: ref,
        Name: full_name, Email: email, Phone: phone,
        "Date of birth": row.dob || "-", City: row.city || "-", Address: row.address || "-",
        Languages: row.languages || "-",
        Instruments: row.instruments.join(", ") || "-",
        "Years teaching": row.years_teaching || "-", "Years performing": row.years_performing || "-",
        Qualification: row.qualification || "-", Grade: row.grade || "-",
        Commitment: row.commitment || "-",
        Days: row.days.join(", ") || "-", "Time bands": row.time_bands.join(", ") || "-",
        Modes: row.modes.join(", ") || "-", Areas: row.areas.join(", ") || "-",
        "Own transport": row.transport || "-",
        "BANK DETAILS": bank,
        "Why join": row.why_join || "-",
        "Stored in portal": stored ? "Yes" : "No (add teacher_applications table)",
        "Next step": "Review in owner portal → Applications → Approve to create login & offer letter.",
      }),
    });
  } catch { /* email best-effort */ }

  return json({ ok: true, ref, stored });
}
