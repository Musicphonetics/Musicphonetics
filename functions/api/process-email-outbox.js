// POST or GET /api/process-email-outbox  (WORKER — secret-protected)
// Drains the email_outbox: sends pending/failed emails via Resend, with bounded
// retries. Never invoked inside a user request — scheduled by Supabase pg_cron +
// pg_net (see supabase/notifications_email.sql) or triggered manually. A slow or
// failing send only affects THIS row; it is retried next run (up to MAX_ATTEMPTS).
//
// Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, MAIL_FROM,
//      EMAIL_WORKER_SECRET (required — matched against the x-worker-secret header),
//      SITE_URL (optional, for CTA links; defaults to https://musicphonetics.com).

const MAX_ATTEMPTS = 5;
const BATCH = 20;
const json = (o, s = 200) => new Response(JSON.stringify(o), { status: s, headers: { "content-type": "application/json" } });
const admin = (env) => ({ apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`, "content-type": "application/json" });

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const inr = (n) => "₹" + Number(n || 0).toLocaleString("en-IN");

// Templates: template_key → (payload, site) → html. Subject comes from the row.
function renderHtml(key, p, site) {
  p = p || {};
  const btn = (href, label) => `<p style="margin:24px 0"><a href="${esc(site)}${esc(href)}" style="background:#161B26;color:#F5F1E8;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:600">${esc(label)}</a></p>`;
  const wrap = (inner) => `<div style="font-family:Arial,Helvetica,sans-serif;color:#161B26;max-width:520px;margin:auto;padding:8px 4px">${inner}<hr style="border:none;border-top:1px solid #eee;margin:24px 0"><p style="font-size:12px;color:#888">Musicphonetics · structured, personalised, transformational music education.</p></div>`;
  switch (key) {
    case "teacher_lead_assigned":
      return wrap(`<h2 style="font-family:Georgia,serif">New lead assigned</h2>
        <p>Hi ${esc(p.teacher_name || "there")},</p><p>A new lead has been assigned to you.</p>
        <p><b>Student:</b> ${esc(p.student || "-")}<br><b>Instrument:</b> ${esc(p.instrument || "-")}<br><b>Area:</b> ${esc(p.area || "-")}<br><b>Preferred mode:</b> ${esc(p.mode || "-")}</p>
        ${btn("/teacher/leads", "Open the lead")}<p style="font-size:12px;color:#888">Ref ${esc(p.lead_code || "")}</p>`);
    case "parent_class_update":
      return wrap(`<h2 style="font-family:Georgia,serif">New class update</h2>
        <p>Your child’s teacher has posted an update${p.date ? ` for ${esc(p.date)}` : ""}.</p>
        ${p.taught ? `<p><b>Covered:</b> ${esc(p.taught)}</p>` : ""}${p.homework ? `<p><b>Homework:</b> ${esc(p.homework)}</p>` : ""}
        ${btn("/parent/classes", "View the update")}`);
    case "parent_payment":
      return wrap(`<h2 style="font-family:Georgia,serif">Payment received</h2>
        <p>We’ve recorded your payment${p.amount ? ` of <b>${inr(p.amount)}</b>` : ""}${p.date ? ` on ${esc(p.date)}` : ""}. Thank you.</p>
        ${btn("/parent/payments", "View payments & receipts")}`);
    case "parent_report":
      return wrap(`<h2 style="font-family:Georgia,serif">Your monthly report is ready</h2>
        <p>Your child’s progress report${p.month ? ` for ${esc(p.month)}` : ""} is now available.</p>
        ${btn("/parent/reports", "Read the report")}`);
    default:
      return wrap(`<p>${esc(p.body || "You have a new update from Musicphonetics.")}</p>`);
  }
}

async function handle(env, req) {
  const secret = req.headers.get("x-worker-secret") || new URL(req.url).searchParams.get("secret") || "";
  if (!env.EMAIL_WORKER_SECRET || secret !== env.EMAIL_WORKER_SECRET) return json({ ok: false, error: "Forbidden" }, 403);
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return json({ ok: false, error: "Not configured" }, 503);
  if (!env.RESEND_API_KEY) return json({ ok: false, error: "RESEND_API_KEY missing" }, 503);

  const site = (env.SITE_URL || "https://musicphonetics.com").replace(/\/$/, "");
  const from = env.MAIL_FROM || "Musicphonetics <onboarding@resend.dev>";

  // Fetch a batch of sendable rows (pending or previously failed, under the cap).
  const qs = `status=in.(pending,failed)&attempt_count=lt.${MAX_ATTEMPTS}&order=scheduled_at.asc&limit=${BATCH}`;
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/email_outbox?${qs}`, { headers: admin(env) });
  if (!res.ok) return json({ ok: false, error: "Fetch failed" }, 502);
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) return json({ ok: true, processed: 0, sent: 0 });

  let sent = 0, failed = 0;
  for (const row of rows) {
    let ok = false, err = null;
    try {
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST", headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({ from, to: [row.recipient_email], subject: row.subject, html: renderHtml(row.template_key, row.payload, site) }),
      });
      ok = r.ok;
      if (!ok) err = (await r.text().catch(() => "")).slice(0, 300);
    } catch (e) { err = String(e).slice(0, 300); }

    const patch = ok
      ? { status: "sent", sent_at: new Date().toISOString(), attempt_count: (row.attempt_count || 0) + 1, last_error: null }
      : { status: "failed", attempt_count: (row.attempt_count || 0) + 1, last_error: err };
    await fetch(`${env.SUPABASE_URL}/rest/v1/email_outbox?id=eq.${row.id}`, {
      method: "PATCH", headers: { ...admin(env), Prefer: "return=minimal" }, body: JSON.stringify(patch),
    }).catch(() => {});
    ok ? sent++ : failed++;
  }
  return json({ ok: true, processed: rows.length, sent, failed });
}

export const onRequestPost = ({ request, env }) => handle(env, request);
export const onRequestGet = ({ request, env }) => handle(env, request);
