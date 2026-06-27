import { NextResponse } from "next/server";
import { buildLeadEmail, type LeadFields } from "@/lib/lead-email";

// Lead submission handler (Phase 1) — emails the team on every submission.
// Delivery priority:
//   1. RESEND_API_KEY      -> send via Resend (best for production / branded HTML).
//   2. LEAD_WEBHOOK_URL    -> POST to a Google Apps Script / automation endpoint
//                            (email + Google Sheets + WATI/Astra).
//   3. Default (no config) -> FormSubmit.co, a free no-key email relay so leads
//                            arrive out of the box. NOTE: the FIRST lead triggers
//                            a one-time activation email from FormSubmit to the
//                            recipient — click it once and all future leads flow.
//
// Env: RESEND_API_KEY, LEAD_EMAIL_TO, LEAD_EMAIL_FROM, LEAD_WEBHOOK_URL.

export const runtime = "nodejs";

const TO = process.env.LEAD_EMAIL_TO ?? "adm.musicphonetics@gmail.com";
const FROM = process.env.LEAD_EMAIL_FROM ?? "Musicphonetics <onboarding@resend.dev>";

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
      // Zero-config default: FormSubmit.co (no API key required).
      const fields: Record<string, string> = {
        _subject: subject,
        _template: "table",
        "Full Name": payload.name ?? "—",
        "Phone": payload.phone ?? "—",
        "Email": payload.email ?? "—",
        "Instrument": payload.instrument ?? "—",
        "Class Mode": payload.mode ?? "—",
        "Student Type": payload.who ?? "—",
        "Age": payload.childAge ?? "—",
        "Location": payload.location ?? "—",
        "Experience": payload.experience ?? "—",
        "Goal": payload.goal ?? "—",
        "Preferred Timing": payload.timing ?? "—",
        "Preferred Start": payload.begin ?? "—",
        "Submitted": payload.receivedAt ?? "",
        "Source": payload.source ?? "Website onboarding",
      };
      const res = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(TO)}`, {
        method: "POST",
        headers: { "content-type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
        signal: AbortSignal.timeout(8000),
      });
      emailed = res.ok;
      via = "formsubmit";
      if (!res.ok) console.error("FormSubmit failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Lead delivery error:", err);
  }

  // Always log so a delivery hiccup never loses the lead.
  console.info("LEAD", { via, emailed, subject, ...payload });

  return NextResponse.json({ ok: true, emailed });
}
