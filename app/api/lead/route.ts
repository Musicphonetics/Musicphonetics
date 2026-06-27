import { NextResponse } from "next/server";

// Lead submission handler.
// Forwards the lead to a configured webhook so it can fan out to
// Google Sheets / owner email / WATI / Astra without changing the client.
//
// Set LEAD_WEBHOOK_URL to a Google Apps Script Web App or automation endpoint.
// If unset, the funnel still works (the client opens WhatsApp with a summary).
// TODO(integration): add owner email + WATI/Astra triggers in the webhook target.

export const runtime = "nodejs";

export async function POST(req: Request) {
  let data: Record<string, unknown> = {};
  try {
    data = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const payload = {
    ...data,
    source: "website-onboarding",
    receivedAt: new Date().toISOString(),
  };

  const url = process.env.LEAD_WEBHOOK_URL;
  if (url) {
    try {
      await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
        // Don't let a slow webhook block the user.
        signal: AbortSignal.timeout(8000),
      });
    } catch (err) {
      // Swallow — the client still proceeds to WhatsApp. Log for diagnostics.
      console.error("Lead webhook failed:", err);
    }
  } else {
    console.info("Lead received (no LEAD_WEBHOOK_URL configured):", payload);
  }

  return NextResponse.json({ ok: true });
}
