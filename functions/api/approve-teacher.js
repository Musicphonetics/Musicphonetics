// POST /api/approve-teacher  (OWNER ONLY)
// The owner reviews a teacher_applications row and approves it here. Only then
// is a Supabase login created and the profile filled from the application.
// Returns the login email + a temporary password for the owner to share, and
// the application data so the owner can print the Offer Letter.
//
// On approval it ALSO emails the teacher directly (their given email) an offer
// letter with their login details, so the offer reaches them the moment they
// are approved. The email is best-effort: if no mail provider is configured the
// approval still succeeds and the owner shares the credentials manually.
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//      RESEND_API_KEY   (optional) - transactional email to the teacher's inbox
//      MAIL_FROM        (optional) - e.g. "Musicphonetics <team@yourdomain.com>"
//                                    must be a domain verified in Resend
// Auth: Authorization: Bearer <owner access token>. Caller must be role='owner'.

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), { status, headers: { "content-type": "application/json" } });

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

// Branded offer-letter email with login details. Returns { sent, note }.
async function emailTeacherOffer(env, { name, email, password }) {
  if (!env.RESEND_API_KEY) return { sent: false, note: "email provider not configured (set RESEND_API_KEY)" };
  const from = env.MAIL_FROM || "Musicphonetics <onboarding@resend.dev>";
  const portal = "https://musicphonetics.pages.dev/teacher/login";
  const first = (name || "there").split(" ")[0];

  const html = `<!doctype html><html><body style="margin:0;background:#f4f1ea;font-family:Arial,Helvetica,sans-serif;color:#161b26">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px">
    <div style="background:#161b26;border-radius:16px 16px 0 0;padding:22px 24px">
      <p style="margin:0;font-size:20px;font-weight:800;letter-spacing:.5px;color:#fff">MUSICPHONETICS</p>
      <p style="margin:6px 0 0;font-size:12px;letter-spacing:1.5px;text-transform:uppercase;color:#c9a227">Teacher Offer &amp; Login Details</p>
    </div>
    <div style="background:#fff;border:1px solid #e7e2d6;border-top:0;border-radius:0 0 16px 16px;padding:24px">
      <p style="margin:0 0 12px;font-size:15px">Dear ${esc(first)},</p>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
        Congratulations — your application to teach with <b>Musicphonetics</b> has been approved.
        Below are your teacher-portal login details. This email serves as your official offer to join the
        Musicphonetics teaching network.
      </p>

      <div style="border:1px solid #e7e2d6;border-radius:12px;padding:16px;margin:16px 0;background:#faf8f3">
        <p style="margin:0 0 10px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a5e0f">Your login</p>
        <p style="margin:4px 0;font-size:14px"><span style="color:#6b6f78">Portal:</span> <a href="${portal}" style="color:#161b26;font-weight:700;text-decoration:none">${portal}</a></p>
        <p style="margin:4px 0;font-size:14px"><span style="color:#6b6f78">Login email:</span> <b>${esc(email)}</b></p>
        <p style="margin:4px 0;font-size:14px"><span style="color:#6b6f78">Temporary password:</span> <b style="font-family:monospace">${esc(password)}</b></p>
        <p style="margin:10px 0 0;font-size:12px;color:#6b6f78">Please change your password after your first sign-in.</p>
      </div>

      <p style="margin:0 0 8px;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#7a5e0f">How your income works</p>
      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
        All fees are collected only through the official Musicphonetics payment account. From each fee, the
        payment interface deducts its processing charge of <b>approximately 3%</b>. From the net settled amount
        that remains, your share is <b>70%</b> and Musicphonetics retains <b>30%</b>. Payouts are made to your
        registered bank/UPI account after each payment is received and verified.
      </p>

      <p style="margin:0 0 14px;font-size:14px;line-height:1.6;color:#3a3f4a">
        Your full <b>Offer &amp; Engagement Letter</b> and <b>Joining Agreement</b> (with the complete terms,
        responsibilities, safeguarding, confidentiality and non-solicitation clauses) will be shared with you to
        read, sign and return. Please sign in, review your profile, and reply to confirm you accept the terms.
      </p>

      <a href="${portal}" style="display:inline-block;background:#161b26;color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 22px;border-radius:999px">Sign in to your portal →</a>

      <p style="margin:18px 0 0;font-size:12px;color:#9aa">Questions? WhatsApp us at +91 87961 99188. This is a private message intended only for ${esc(email)}.</p>
      <p style="margin:14px 0 0;font-size:13px;color:#3a3f4a">Warm regards,<br><b>Abhishek Kumar</b><br>Founder &amp; Director, Musicphonetics</p>
    </div>
  </div></body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: "Your Musicphonetics teacher offer & login details",
        html,
        reply_to: "guitaristabhishek07@gmail.com",
      }),
    });
    if (res.ok) return { sent: true, note: "sent" };
    const e = await res.json().catch(() => ({}));
    return { sent: false, note: e.message || `provider error (${res.status})` };
  } catch (err) {
    return { sent: false, note: "network error sending email" };
  }
}

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
  return { ok: true };
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

  // 3) Fill the profile from the application.
  const bank = [
    app.bank_holder && `A/C name: ${app.bank_holder}`,
    app.bank_name && `Bank: ${app.bank_name}`,
    app.bank_account && `A/C: ${app.bank_account}`,
    app.bank_ifsc && `IFSC: ${app.bank_ifsc}`,
    app.bank_upi && `UPI: ${app.bank_upi}`,
  ].filter(Boolean).join(" · ") || null;

  if (teacherId) {
    await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${teacherId}`, {
      method: "PATCH",
      headers: { ...admin(env), Prefer: "return=minimal" },
      body: JSON.stringify({
        full_name: app.full_name, role: "teacher", phone: app.phone || null, email: app.email,
        instruments: app.instruments || null, regions: app.areas || null, preferred_modes: app.modes || null,
        experience_years: Number.isFinite(Number(app.years_teaching)) ? Number(app.years_teaching) : null,
        qualifications: app.qualification || null, bank_upi: bank,
      }),
    }).catch(() => {});
  }

  // 4) Mark the application approved.
  await fetch(`${env.SUPABASE_URL}/rest/v1/teacher_applications?id=eq.${appId}`, {
    method: "PATCH",
    headers: { ...admin(env), Prefer: "return=minimal" },
    body: JSON.stringify({ status: "approved", teacher_id: teacherId, approved_at: new Date().toISOString() }),
  }).catch(() => {});

  // 5) Email the teacher their offer + login details (best-effort).
  const mail = await emailTeacherOffer(env, { name: app.full_name, email: app.email, password });

  return json({
    ok: true,
    teacher_id: teacherId,
    login_email: app.email,
    temp_password: password,
    emailed: mail.sent,
    email_note: mail.note,
  });
}
