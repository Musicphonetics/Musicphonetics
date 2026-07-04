"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Stave } from "@/components/ui/Stave";

// Cashfree hosted Payment Form — collects name, phone, and amount on
// Cashfree's secure page. Configure in the Cashfree dashboard:
//   Redirect URL → https://musicphonetics.pages.dev/welcome
//   Webhook URL  → https://musicphonetics.pages.dev/api/cashfree/webhook
const CASHFREE_FORM_URL = "https://payments.cashfree.com/forms?code=musicphonetics";

// Plan list prices (₹/month) — shown for context; ?amt= overrides for the
// personalised links the owner shares with new and existing students.
const PLAN_AMOUNTS: Record<string, { name: string; amount: number }> = {
  foundation: { name: "Foundation", amount: 12000 },
  signature: { name: "Signature", amount: 18000 },
  "directors-circle": { name: "Director's Circle", amount: 28000 },
};

export function PayClient() {
  const params = useSearchParams();
  const planKey = (params.get("plan") || "").toLowerCase();
  const plan = PLAN_AMOUNTS[planKey];
  const amtParam = Math.round(Number(params.get("amt") || ""));
  const amount = Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount ?? 0;
  const planName = plan?.name ?? "Musicphonetics classes";
  const name = params.get("name") || "";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-7 shadow-card-hover backdrop-blur-md sm:p-8">
        <Stave className="w-16 opacity-70" />
        <p className="mt-5 eyebrow text-gold">Secure payment</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-paper sm:text-3xl">
          {name ? `${name} · ${planName}` : planName}
        </h1>
        {amount > 0 && (
          <>
            <p className="mt-1 font-display text-4xl font-semibold text-gold">
              ₹{amount.toLocaleString("en-IN")}
            </p>
            {plan && <p className="mt-1 text-sm text-paper/60">per month · 8 classes</p>}
          </>
        )}

        <p className="mt-6 text-sm leading-relaxed text-paper/75">
          You&apos;ll complete your payment on Cashfree&apos;s secure page — enter
          your name, phone, and the amount{amount > 0 ? ` (₹${amount.toLocaleString("en-IN")})` : ""} there.
        </p>

        <div className="mt-6">
          <Button href={CASHFREE_FORM_URL} external fullWidth size="lg" variant="light">
            Pay securely with Cashfree
          </Button>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-paper/60">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          Encrypted · UPI, cards &amp; netbanking via Cashfree
        </p>
      </div>

      <p className="mt-5 text-center text-sm text-paper/60">
        Need help? <Link href="/support" className="font-semibold text-gold underline underline-offset-2">We reply immediately</Link>.
      </p>
    </div>
  );
}
