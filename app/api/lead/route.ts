import { NextResponse } from "next/server";
import { buildLeadEmail, type LeadFields } from "@/lib/lead-email";

// Lead submission handler (Phase 1) — emails the team on every submission.
// Delivery priority:
//   1. RESEND_API_KEY      -> send via Resend (best for production / branded HTML).
//   2. LEAD_WEBHOOK_URL    -> POST to a Google Apps Script / automation endpoint
//                            (email + Google Sheets + WATI/Astra).
//   3. Default (no config) -> Web3Forms (no backend, no activation step). Leads
//                            arrive by email immediately to the account inbox.
//
// Env: RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM, LEAD_WEBHOOK_URL,
//      WEB3FORMS_ACCESS_KEY.

export const runtime = "nodejs";

const TO = process.env.LEAD_EMAIL_TO ?? "adm.musicphonetics@gmail.com";
const FROM = process.env.LEAD_EMAIL_FROM ?? "Musicphonetics <onboarding@resend.dev>";
// Web3Forms access key (safe to expose; tied to the destination inbox).
const WEB3FORMS_KEY =
  process.env.WEB3FORMS_ACCESS_KEY ?? "1a5d9694-46b9-4236-8ced-1b68b65b5097";

export async function POST(req: Request) {
  let data: LeadFields = {};
  try {
    data = (await req.json()) as LeadFields;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const payload: LeadFields = {
    ...data,
    source: data.source ?? "Website onboarding",
    receivedAt: new Date().toISOString(),
  };

  const { subject, html, text } = buildLeadEmail(payload);
  let emailed = false;
  let via = "none";

  try {
    if (process.env.RESEND_API_KEY) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ from: FROM, to: [TO], subject, html, text }),
        signal: AbortSignal.timeout(8000),
      });
      emailed = res.ok;
      via = "resend";
      if (!res.ok) console.error("Resend failed:", res.status, await res.text());
    } else if (process.env.LEAD_WEBHOOK_URL) {
      const res = await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: TO, subject, html, ...payload }),
        signal: AbortSignal.timeout(8000),
      });
      emailed = res.ok;
      via = "webhook";
    } else {
      // Zero-config default: Web3Forms (no API key step, immediate email).
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "content-type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject: `New Musicphonetics Lead — ${payload.name ?? "Unknown"} (${payload.instrument ?? "Music"})`,
          from_name: "Musicphonetics Website",
          // Honeypot — must stay empty.
          botcheck: "",
          // Reply-to the lead when they shared an email.
          ...(payload.email ? { email: payload.email } : {}),
          Name: payload.name ?? "—",
          WhatsApp: payload.phone ?? "—",
          Email: payload.email ?? "—",
          Instrument: payload.instrument ?? "—",
          Mode: payload.mode ?? "—",
          "Student Type": payload.who ?? "—",
          Age: payload.childAge ?? "—",
          Area: payload.location ?? "—",
          Experience: payload.experience ?? "—",
          Goal: payload.goal ?? "—",
          "Preferred Timing": payload.timing ?? "—",
          "Preferred Start": payload.begin ?? "—",
          Submitted: payload.receivedAt ?? "",
          Source: payload.source ?? "Website onboarding",
        }),
        signal: AbortSignal.timeout(8000),
      });
      const json = (await res.json().catch(() => ({}))) as { success?: boolean };
      emailed = res.ok && json.success !== false;
      via = "web3forms";
      if (!emailed) console.error("Web3Forms failed:", res.status, json);
    }
  } catch (err) {
    console.error("Lead delivery error:", err);
  }

  // Always log so a delivery hiccup never loses the lead.
  console.info("LEAD", { via, emailed, subject, ...payload });

  // Reflect delivery status so the client never silently fails.
  return NextResponse.json({ ok: emailed, emailed, via }, { status: emailed ? 200 : 502 });
}
