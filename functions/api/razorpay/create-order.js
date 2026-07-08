/**
 * Cloudflare Pages Function - POST /api/razorpay/create-order
 *
 * Creates a Razorpay order server-side and returns the order_id for Razorpay
 * Standard Checkout. Secrets live ONLY in Cloudflare Pages env vars:
 *   RAZORPAY_KEY_ID      - key id (rzp_test_... first; switch to rzp_live_... after KYC)
 *   RAZORPAY_KEY_SECRET  - key secret (server env only, NEVER sent to the client)
 *
 * The Node `razorpay` SDK is not used here: Pages Functions run on the Workers
 * runtime, which has no Node core modules. We call the REST API with fetch and
 * HTTP Basic auth, matching the existing Cashfree function.
 *
 * A payment is trusted ONLY after /api/razorpay/verify-payment confirms the
 * signature - never from the client alone.
 */

// Amounts are in paise. Razorpay's floor is 100 paise (₹1); we also cap high
// so a tampered request can't create an absurd order.
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 20000000; // ₹2,00,000

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Trim so a stray space/newline pasted into the dashboard can't break auth.
  const keyId = (env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    return json({ ok: false, error: "Payments are not configured yet." }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const amount = Math.round(Number(body.amount)); // paise
  const currency = String(body.currency || "INR").toUpperCase().slice(0, 3);
  const receipt = String(body.receipt || `mp_${Date.now()}`).slice(0, 40);

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return json({ ok: false, error: "Invalid amount." }, 400);
  }

  // Small, non-sensitive labels to help reconcile the order in the dashboard.
  const notes = {
    plan: String(body.plan || "").slice(0, 60),
    student: String(body.name || "").slice(0, 100),
  };

  const auth = "Basic " + btoa(`${keyId}:${keySecret}`);

  let res;
  try {
    res = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: { "content-type": "application/json", authorization: auth },
      body: JSON.stringify({ amount, currency, receipt, notes }),
    });
  } catch (e) {
    console.error("Razorpay order network error", String(e).slice(0, 300));
    return json({ ok: false, error: "Could not reach the payment gateway. Please try again." }, 500);
  }

  if (res.status === 401) {
    // Safe diagnostics only - the key id is publishable, and we expose the
    // SECRET's length (never its value) so a wrong/short paste is obvious.
    // The correct test secret is 24 characters.
    console.error("Razorpay 401", { keyId, keyIdLen: keyId.length, secretLen: keySecret.length });
    return json({
      ok: false,
      error: "Payment gateway authentication failed. Please recheck the Razorpay key id and secret in Cloudflare.",
      detail: { key_id: keyId, key_id_len: keyId.length, secret_len: keySecret.length },
    }, 401);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    console.error("Razorpay order failed", res.status, JSON.stringify(data).slice(0, 500));
    return json({ ok: false, error: "Could not start the payment. Please try again." }, 500);
  }

  // key_id is the publishable key - safe to return so the static frontend can
  // open Checkout without a build-time public env var.
  return json({
    ok: true,
    order_id: data.id,
    amount: data.amount,
    currency: data.currency,
    key_id: env.RAZORPAY_KEY_ID,
  });
}
