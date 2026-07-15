/**
 * Cloudflare Pages Function - POST /api/razorpay/verify-payment
 *
 * Verifies a Razorpay Standard Checkout payment signature server-side.
 *   signature = HMAC_SHA256(razorpay_order_id + "|" + razorpay_payment_id, KEY_SECRET)
 * A payment is trusted ONLY when the computed signature matches the one
 * Razorpay returned. The secret never leaves the server.
 *
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

// Generous per-isolate rate limit — enough headroom to never block a real
// verification, but stops brute-force signature guessing.
const HITS = new Map();
function rl(key, limit, windowMs) {
  const now = Date.now();
  const rec = HITS.get(key);
  if (!rec || now > rec.reset) { HITS.set(key, { count: 1, reset: now + windowMs }); return true; }
  if (rec.count >= limit) return false;
  rec.count += 1; return true;
}

// HMAC-SHA256 -> lowercase hex, using the Workers Web Crypto API.
async function hmacSha256Hex(secret, message) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Constant-time string compare so we don't leak the signature byte by byte.
function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const keySecret = (env.RAZORPAY_KEY_SECRET || "").trim();
  if (!keySecret) {
    return json({ ok: false, error: "Payments are not configured yet." }, 503);
  }

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  if (!rl(`verify:${ip}`, 60, 60000)) return json({ ok: false, error: "Too many attempts." }, 429);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const orderId = body.razorpay_order_id;
  const paymentId = body.razorpay_payment_id;
  const signature = body.razorpay_signature;

  if (!orderId || !paymentId || !signature) {
    return json({ ok: false, verified: false, error: "Missing payment fields." }, 400);
  }

  const expected = await hmacSha256Hex(keySecret, `${orderId}|${paymentId}`);

  if (!timingSafeEqual(expected, String(signature))) {
    // Signature mismatch: DO NOT treat this as paid.
    return json({ ok: false, verified: false, error: "Payment could not be verified." }, 400);
  }

  return json({
    ok: true,
    verified: true,
    order_id: orderId,
    payment_id: paymentId,
  });
}
