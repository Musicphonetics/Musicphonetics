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

// Server-side price authority: a known plan's monthly fee (paise) is the CEILING
// for that plan's order. A pro-rated first month is <= the monthly fee, so we
// allow anything from MIN up to the plan price; we never trust an amount above
// the plan's real price. Unknown/no plan falls back to the MIN/MAX bounds.
const PLAN_PRICE_PAISE = {
  foundation: 800000,     // ₹8,000
  main: 1200000,          // ₹12,000
  "directors-circle": 2800000, // ₹28,000 (bespoke ceiling)
};

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Tiny per-isolate rate limiter. Blunts bursts/abuse without extra infra.
const HITS = new Map();
function rl(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1;
  return true;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // Trim so a stray space/newline pasted into the dashboard can't break auth.
  const keyId = (env.RAZORPAY_KEY_ID || "").trim();
  const keySecret = (env.RAZORPAY_KEY_SECRET || "").trim();

  if (!keyId || !keySecret) {
    return json({ ok: false, error: "Payments are not configured yet." }, 503);
  }

  // Basic abuse protection.
  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rl(`order:${ip}`, 20, 60000)) return json({ ok: false, error: "Too many attempts. Please wait a moment." }, 429);

  // Cap the body so a huge payload can't be forced through.
  const raw = await request.text();
  if (raw.length > 4000) return json({ ok: false, error: "Invalid request." }, 400);
  let body;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const amount = Math.round(Number(body.amount)); // paise
  const currency = String(body.currency || "INR").toUpperCase().slice(0, 3);
  const receipt = String(body.receipt || `mp_${Date.now()}`).slice(0, 40);
  const planKey = String(body.plan_key || body.planKey || "").toLowerCase().trim();

  if (!Number.isFinite(amount) || amount < MIN_AMOUNT || amount > MAX_AMOUNT) {
    return json({ ok: false, error: "Invalid amount." }, 400);
  }

  // Server-side price validation: for a known plan, the amount may not exceed
  // that plan's real monthly fee (pro-rata is always <=). Blocks URL tampering.
  const ceiling = PLAN_PRICE_PAISE[planKey];
  if (ceiling && amount > ceiling) {
    return json({ ok: false, error: "Amount does not match the selected plan." }, 400);
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
    const live = keyId.startsWith("rzp_live_");
    return json({
      ok: false,
      error: live
        ? "Payment authentication failed. Live Razorpay keys only work once your account is ACTIVATED (KYC approved), and the live Key ID and Key Secret must be a matching pair. Use test keys (rzp_test_) to verify, then switch to live after activation."
        : "Payment authentication failed. Check that the Razorpay Key ID and Key Secret are a matching pair from the same mode.",
      detail: { key_id: keyId, mode: live ? "live" : "test", key_id_len: keyId.length, secret_len: keySecret.length },
    }, 401);
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.id) {
    console.error("Razorpay order failed", res.status, JSON.stringify(data).slice(0, 500));
    return json({ ok: false, error: "Could not start the payment. Please try again." }, 500);
  }

  // key_id is the publishable key - safe to return so the static frontend can
  // open Checkout without a build-time public env var (trimmed, matching auth).
  return json({
    ok: true,
    order_id: data.id,
    amount: data.amount,
    currency: data.currency,
    key_id: keyId,
  });
}
