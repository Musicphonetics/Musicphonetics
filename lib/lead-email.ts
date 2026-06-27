// ============================================================================
// Musicphonetics — Lead notification email (premium SaaS style)
// ============================================================================

export interface LeadFields {
  name?: string;
  phone?: string;
  email?: string;
  instrument?: string;
  mode?: string;
  who?: string;
  childAge?: string;
  location?: string;
  experience?: string;
  goal?: string;
  timing?: string;
  begin?: string;
  source?: string;
  receivedAt?: string;
}

const esc = (s: unknown) =>
  String(s ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

export function buildLeadEmail(d: LeadFields): { subject: string; html: string; text: string } {
  const instrument = d.instrument || "Music";
  const place = d.location || "Delhi NCR";
  const when = d.receivedAt
    ? new Date(d.receivedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
    : new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  const subject = `🎵 New Musicphonetics Lead | ${instrument} | ${place}`;

  const rows: [string, string][] = [
    ["Full Name", d.name || "—"],
    ["Phone Number", d.phone || "—"],
    ["Email Address", d.email || "—"],
    ["Instrument", d.instrument || "—"],
    ["Class Mode", d.mode || "—"],
    ["Student Type", d.who || "—"],
    ["Age", d.childAge || "—"],
    ["Location", d.location || "—"],
    ["Experience Level", d.experience || "—"],
    ["Learning Goal", d.goal || "—"],
    ["Preferred Timing", d.timing || "—"],
    ["Preferred Start", d.begin || "—"],
    ["Submitted", when],
    ["Source", d.source || "Website onboarding"],
  ];

  const rowsHtml = rows
    .map(
      ([k, v], i) => `
      <tr style="background:${i % 2 ? "#ffffff" : "#f6f4ef"};">
        <td style="padding:12px 18px;font:600 13px/1.4 'Hanken Grotesk',Arial,sans-serif;color:#6b7280;width:42%;">${esc(k)}</td>
        <td style="padding:12px 18px;font:500 14px/1.5 'Hanken Grotesk',Arial,sans-serif;color:#161B26;">${esc(v)}</td>
      </tr>`
    )
    .join("");

  const html = `<!doctype html><html><body style="margin:0;background:#ECE8DF;padding:24px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 8px 30px rgba(22,27,38,.10);">
      <tr><td style="background:#161B26;padding:28px 28px 24px;">
        <div style="font:600 12px/1 'Hanken Grotesk',Arial,sans-serif;letter-spacing:3px;text-transform:uppercase;color:#C9A227;">Musicphonetics · New Enquiry</div>
        <div style="margin-top:10px;font:600 24px/1.2 Georgia,'Times New Roman',serif;color:#F6F4EF;">${esc(instrument)} lesson enquiry</div>
        <div style="margin-top:6px;font:400 14px/1.5 'Hanken Grotesk',Arial,sans-serif;color:rgba(246,244,239,.7);">${esc(d.name || "A new visitor")} · ${esc(place)}</div>
      </td></tr>
      <tr><td style="padding:8px 16px 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;border-radius:12px;overflow:hidden;border:1px solid rgba(22,27,38,.10);">
          ${rowsHtml}
        </table>
      </td></tr>
      <tr><td style="padding:18px 28px 28px;">
        <a href="tel:${esc(d.phone || "")}" style="display:inline-block;background:#C9A227;color:#161B26;font:600 14px/1 'Hanken Grotesk',Arial,sans-serif;text-decoration:none;padding:13px 22px;border-radius:999px;">Call ${esc(d.name || "lead")}</a>
        <div style="margin-top:18px;font:400 12px/1.6 'Hanken Grotesk',Arial,sans-serif;color:#9ca3af;">This lead was captured by the Musicphonetics website onboarding. Respond within 15 minutes for best conversion.</div>
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`;

  const text = `New Musicphonetics Lead\n\n${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}`;

  return { subject, html, text };
}
