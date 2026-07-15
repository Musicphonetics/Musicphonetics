// ============================================================================
// Razorpay Standard Checkout - client helpers.
// The secret key never lives here. We only ever touch the publishable key id
// (returned by our create-order Function or inlined as NEXT_PUBLIC_RAZORPAY_KEY_ID)
// and the order created server-side.
// ============================================================================

const CHECKOUT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export interface CreateOrderInput {
  amount: number; // paise
  currency?: string;
  receipt?: string;
  plan?: string;
  plan_key?: string; // stable key for server-side price validation
  name?: string;
}
export interface CreateOrderResult {
  ok: boolean;
  order_id: string;
  amount: number;
  currency: string;
  key_id: string;
  error?: string;
}
export interface RazorpayHandlerResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
export interface VerifyResult {
  ok: boolean;
  verified: boolean;
  order_id?: string;
  payment_id?: string;
  error?: string;
}

// Minimal shape of the Razorpay Checkout global we rely on.
interface RazorpayInstance {
  open: () => void;
  on: (event: "payment.failed", cb: (resp: { error?: { description?: string } }) => void) => void;
}
type RazorpayCtor = new (options: Record<string, unknown>) => RazorpayInstance;
declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

// Inject checkout.js once and resolve when it's ready. A failed load is not
// cached, so the next attempt (or a retry click) re-injects a fresh script
// instead of hanging forever on a dead tag. Also guarded by a timeout.
let loadPromise: Promise<boolean> | null = null;

export function loadRazorpay(timeoutMs = 15000): Promise<boolean> {
  if (typeof window === "undefined") return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise<boolean>((resolve) => {
    // Remove any previous (possibly failed) tag so we always start clean.
    document.querySelectorAll("script[data-razorpay]").forEach((n) => n.remove());

    const s = document.createElement("script");
    s.src = CHECKOUT_SRC;
    s.async = true;
    s.setAttribute("data-razorpay", "1");

    let settled = false;
    const finish = (ok: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      const good = ok && Boolean(window.Razorpay);
      if (!good) {
        // Do not cache a failure - allow a clean retry next time.
        loadPromise = null;
        s.remove();
      }
      resolve(good);
    };

    const timer = setTimeout(() => finish(false), timeoutMs);
    s.onload = () => finish(true);
    s.onerror = () => finish(false);
    document.body.appendChild(s);
  });
  return loadPromise;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const res = await fetch("/api/razorpay/create-order", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
  const data = (await res.json().catch(() => ({}))) as CreateOrderResult;
  if (!res.ok || !data.ok || !data.order_id) {
    throw new Error(data.error || "Could not start the payment. Please try again.");
  }
  return data;
}

export async function verifyPayment(resp: RazorpayHandlerResponse): Promise<VerifyResult> {
  const res = await fetch("/api/razorpay/verify-payment", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(resp),
  });
  return (await res.json().catch(() => ({ ok: false, verified: false }))) as VerifyResult;
}
