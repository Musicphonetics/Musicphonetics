// Shared transactional mailer for Cloudflare Pages Functions.
// Underscore-prefixed → importable by other functions, never routed as an endpoint.
//
// Provider order (first configured wins):
//   1) BREVO_API_KEY   → Brevo (Sendinblue). Works with a SINGLE VERIFIED SENDER —
//                        you verify one email address (e.g. your Gmail) in Brevo and
//                        can then send to ANY recipient. No domain required. Free tier
//                        ~300 emails/day. This is the "no-domain, send now" path.
//   2) RESEND_API_KEY  → Resend. Needs a VERIFIED DOMAIN to reach arbitrary inboxes;
//                        in test mode it only delivers to your own Resend-account email.
//
// From address: MAIL_FROM ("Name <email@host>") or MAIL_FROM_EMAIL / MAIL_FROM_NAME.
// Returns { sent: boolean, note: string } and never throws.

// Parse "Musicphonetics <team@x.com>" → { name, email }. Falls back to env pieces.
export function parseFrom(env) {
  const raw = env.MAIL_FROM || "";
  const m = raw.match(/^\s*(.*?)\s*<\s*([^>]+)\s*>\s*$/);
  if (m) return { name: (m[1] || "Musicphonetics").replace(/^"|"$/g, "").trim(), email: m[2].trim() };
  if (raw.includes("@")) return { name: env.MAIL_FROM_NAME || "Musicphonetics", email: raw.trim() };
  return {
    name: env.MAIL_FROM_NAME || "Musicphonetics",
    email: env.MAIL_FROM_EMAIL || "onboarding@resend.dev",
  };
}

export function mailerConfigured(env) {
  return !!(env.BREVO_API_KEY || env.RESEND_API_KEY);
}

// send one email. opts: { to, subject, html, replyTo }
export async function sendEmail(env, { to, subject, html, replyTo }) {
  const from = parseFrom(env);
  const reply = replyTo || env.MAIL_REPLY_TO || "guitaristabhishek07@gmail.com";

  // 1) Brevo — no domain needed (single verified sender).
  if (env.BREVO_API_KEY) {
    // Guard against the common mix-up: the REST API needs an API key (xkeysib-…),
    // NOT the SMTP key (xsmtpsib-…). Workers can't speak SMTP, so we can't use it.
    if (/^xsmtpsib-/i.test(env.BREVO_API_KEY.trim())) {
      return { sent: false, note: "BREVO_API_KEY looks like a Brevo SMTP key (xsmtpsib-…). This needs the REST API key that starts with xkeysib- (Brevo → SMTP & API → API keys → Generate a new API key)." };
    }
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "api-key": env.BREVO_API_KEY, "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          sender: from,
          to: [{ email: to }],
          subject,
          htmlContent: html,
          replyTo: { email: reply },
        }),
      });
      if (res.ok) return { sent: true, note: "sent via Brevo" };
      const e = await res.json().catch(() => ({}));
      return { sent: false, note: e.message || `Brevo error (${res.status})` };
    } catch {
      return { sent: false, note: "network error sending via Brevo" };
    }
  }

  // 2) Resend — needs a verified domain for arbitrary recipients.
  if (env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "content-type": "application/json" },
        body: JSON.stringify({
          from: `${from.name} <${from.email}>`,
          to: [to],
          subject,
          html,
          reply_to: reply,
        }),
      });
      if (res.ok) return { sent: true, note: "sent via Resend" };
      const e = await res.json().catch(() => ({}));
      return { sent: false, note: e.message || `Resend error (${res.status})` };
    } catch {
      return { sent: false, note: "network error sending via Resend" };
    }
  }

  return { sent: false, note: "no mail provider configured (set BREVO_API_KEY or RESEND_API_KEY)" };
}
