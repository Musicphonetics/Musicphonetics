/**
 * Cloudflare Pages Function - POST /api/cashfree/create-order
 *
 * Creates a Cashfree order server-side and returns the payment_session_id for
 * the drop-in checkout. Secrets live ONLY in Cloudflare Pages env vars:
 *   CASHFREE_APP_ID      - app id (TEST first; switch to LIVE only after approval)
 *   CASHFREE_SECRET_KEY  - secret key (server env only, never client)
 *   CASHFREE_ENV         - "TEST" (default) or "PROD"
 *
 * A payment is marked Paid ONLY by the verified webhook - never from here or
 * from any client redirect.
 */

const API_VERSION = "2023-08-01";

// Sane bounds so a tampered URL can't create absurd orders. Special rates
// below list price are legitimate (owner shares custom links), so we bound
// rather than pin to plan price; the webhook records the ACTUAL paid amount.
const MIN_AMOUNT = 500;
const MAX_AMOUNT = 200000;

const PLANS = {
  foundation: "Foundation",
  signature: "Signature",
  "directors-circle": "Director's Circle",
  custom: "Custom",
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.CASHFREE_APP_ID || !env.CASHFREE_SECRET_KEY) {
    return json({ ok: false, error: "Payments are not configured yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const plan = String(body.plan || "custom").toLowerCase();
  const planName = PLANS[plan] || "Custom";
  const amount = Math.round(Number(body.amount));
  const name = String(body.name || "").trim().slice(0, 100);
  const phoneDigits = String(body.phone || "").replace(/\D/g, "").slice(-10);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return json({ ok: false, error: "Invalid amount." }, 400);
  }
  if (phoneDigits.length !== 10) {
    return json({ ok: false, error: "A valid 10-digit phone number is required." }, 400);
  }
  if (name.length < 2) {
    return json({ ok: false, error: "Name is required." }, 400);
  }

  const isProd = (env.CASHFREE_ENV || "TEST").toUpperCase() === "PROD";
  const base = isProd ? "https://api.cashfree.com" : "https://sandbox.cashfree.com";
  const origin = new URL(request.url).origin;
  const orderId = `mp_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;

  const res = await fetch(`${base}/pg/orders`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-version": API_VERSION,
      "x-client-id": env.CASHFREE_APP_ID,
      "x-client-secret": env.CASHFREE_SECRET_KEY,
    },
    body: JSON.stringify({
      order_id: orderId,
      order_amount: amount,
      order_currency: "INR",
      order_note: `Musicphonetics · ${planName}`,
      customer_details: {
        customer_id: `mp_${phoneDigits}`,
        customer_name: name,
        customer_phone: phoneDigits,
      },
      order_meta: {
        return_url: `${origin}/welcome?order_id={order_id}`,
        notify_url: `${origin}/api/cashfree/webhook`,
      },
      order_tags: { plan: planName },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.payment_session_id) {
    console.error("Cashfree order failed", res.status, JSON.stringify(data).slice(0, 500));
    return json({ ok: false, error: "Could not start the payment. Please try again." }, 502);
  }

  return json({
    ok: true,
    payment_session_id: data.payment_session_id,
    order_id: data.order_id || orderId,
    mode: isProd ? "production" : "sandbox",
  });
}
