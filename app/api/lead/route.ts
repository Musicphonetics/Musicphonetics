import { NextResponse } from "next/server";
import { buildLeadEmail, type LeadFields } from "@/lib/lead-email";

// Lead submission handler (Phase 1).
// On submit, sends a professionally formatted HTML email to the team. Delivery
// path, in priority order:
//   1. RESEND_API_KEY set  -> send via Resend (recommended).
//   2. LEAD_WEBHOOK_URL set -> POST {subject, html, ...fields} to a Google
//      Apps Script / automation endpoint that emails + writes to Sheets.
//   3. Neither -> log the lead (so nothing is lost in dev).
//
// Env:
//   RESEND_API_KEY     Resend API key
//   LEAD_EMAIL_TO      recipient (default adm.musicphonetics@gmail.com)
//   LEAD_EMAIL_FROM    verified sender (default Resend test sender)
//   LEAD_WEBHOOK_URL   alternative/extra fan-out endpoint

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

  // 1) Resend
  if (process.env.RESEND_API_KEY) {
    try {
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
      if (!res.ok) console.error("Resend failed:", res.status, await res.text());
    } catch (err) {
      console.error("Resend error:", err);
    }
  }

  // 2) Webhook (Apps Script / automation) — also good for Google Sheets logging
  if (process.env.LEAD_WEBHOOK_URL) {
    try {
      await fetch(process.env.LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ to: TO, subject, html, ...payload }),
        signal: AbortSignal.timeout(8000),
      });
      emailed = true;
    } catch (err) {
      console.error("Lead webhook failed:", err);
    }
  }

  // 3) Nothing configured — don't lose the lead in dev.
  if (!process.env.RESEND_API_KEY && !process.env.LEAD_WEBHOOK_URL) {
    console.info("LEAD (no delivery configured):", { subject, ...payload });
  }

  return NextResponse.json({ ok: true, emailed });
}
