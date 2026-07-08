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

  if (!env.RAZORPAY_KEY_SECRET) {
    return json({ ok: false, error: "Payments are not configured yet." }, 503);
  }

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

  const expected = await hmacSha256Hex(env.RAZORPAY_KEY_SECRET, `${orderId}|${paymentId}`);

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
