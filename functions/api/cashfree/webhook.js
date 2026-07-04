/**
 * Cloudflare Pages Function — POST /api/cashfree/webhook
 *
 * The ONLY place a payment becomes "Paid".
 * 1. Verifies the Cashfree webhook signature (HMAC-SHA256, base64) — requests
 *    that fail verification are rejected.
 * 2. On PAYMENT_SUCCESS, POSTs a Payments row to the owner's Google Sheet via
 *    APPS_SCRIPT_URL (Apps Script also de-dupes by Payment ID and flips the
 *    matching Leads row to Paid by phone — see scripts/apps-script-payments.gs).
 *
 * Env (Cloudflare Pages, server only):
 *   CASHFREE_SECRET_KEY — used for signature verification
 *   APPS_SCRIPT_URL     — deployed Apps Script /exec URL (sheet write-back)
 */

async function verifySignature(rawBody, timestamp, signature, secret) {
  if (!timestamp || !signature) return false;
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(timestamp + rawBody));
  const expected = btoa(String.fromCharCode(...new Uint8Array(sig)));
  // Constant-time-ish comparison
  if (expected.length !== signature.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;
  if (!env.CASHFREE_SECRET_KEY) return new Response("not configured", { status: 503 });

  const rawBody = await request.text();
  const ok = await verifySignature(
    rawBody,
    request.headers.get("x-webhook-timestamp"),
    request.headers.get("x-webhook-signature"),
    env.CASHFREE_SECRET_KEY
  );
  if (!ok) return new Response("invalid signature", { status: 401 });

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("bad payload", { status: 400 });
  }

  const type = event.type || "";
  // Acknowledge everything that isn't a success so Cashfree stops retrying.
  if (!type.includes("SUCCESS")) return new Response("ok", { status: 200 });

  const data = event.data || {};
  const order = data.order || {};
  const payment = data.payment || {};
  const customer = data.customer_details || {};

  const row = {
    source: "cashfree-webhook",
    paymentId: String(payment.cf_payment_id || ""),
    date: payment.payment_time || new Date().toISOString(),
    student: customer.customer_name || "",
    phone: (customer.customer_phone || "").replace(/\D/g, "").slice(-10),
    package: (order.order_tags && order.order_tags.plan) || "",
    amount: payment.payment_amount ?? order.order_amount ?? "",
    mode: "Cashfree",
    paymentStatus: "Paid",
    invoice: order.order_id || "",
    notes: `Method: ${payment.payment_group || "-"} · Event: ${type}`,
  };

  if (env.APPS_SCRIPT_URL) {
    try {
      // text/plain avoids the Apps Script CORS preflight; it parses the JSON body.
      await fetch(env.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "content-type": "text/plain;charset=utf-8" },
        body: JSON.stringify(row),
      });
    } catch (err) {
      // Log but still 200 — Cashfree retries would double-write otherwise; the
      // payment itself is safe inside Cashfree's dashboard regardless.
      console.error("Sheet write-back failed", String(err));
    }
  } else {
    console.warn("APPS_SCRIPT_URL not set; payment logged only in Cashfree", row.invoice);
  }

  return new Response("ok", { status: 200 });
}
