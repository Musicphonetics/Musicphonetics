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

// Inject checkout.js once and resolve when it's ready.
export function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if (window.Razorpay) return resolve(true);
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${CHECKOUT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(Boolean(window.Razorpay)));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const s = document.createElement("script");
    s.src = CHECKOUT_SRC;
    s.async = true;
    s.onload = () => resolve(Boolean(window.Razorpay));
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
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
