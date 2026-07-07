"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Stave } from "@/components/ui/Stave";
import { computeProrata } from "@/lib/policy";

// Cashfree hosted Payment Form - collects name, phone, and amount on
// Cashfree's secure page. Configure in the Cashfree dashboard:
//   Redirect URL -> https://musicphonetics.pages.dev/welcome
//   Webhook URL  -> https://musicphonetics.pages.dev/api/cashfree/webhook
const CASHFREE_FORM_URL = "https://payments.cashfree.com/forms?code=musicphonetics";

const PLAN_AMOUNTS: Record<string, { name: string; amount: number }> = {
  foundation: { name: "Foundation", amount: 8000 },
  main: { name: "Main Musicphonetics Pathway", amount: 12000 },
  "directors-circle": { name: "Director's Circle", amount: 28000 },
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

export function PayClient() {
  const params = useSearchParams();
  const planKey = (params.get("plan") || "").toLowerCase();
  const plan = PLAN_AMOUNTS[planKey];
  const amtParam = Math.round(Number(params.get("amt") || ""));
  const monthly = Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount ?? 0;
  const planName = plan?.name ?? "Musicphonetics classes";
  const name = params.get("name") || "";

  const pr = monthly > 0 ? computeProrata(monthly) : null;
  // If enrolling in the first two days of the month, the pro-rated amount is
  // effectively the full month; show the full fee to avoid confusion.
  const payNow = pr ? (pr.day <= 2 ? monthly : pr.firstPayment) : 0;
  const prorated = pr ? pr.day > 2 : false;

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-7 shadow-card-hover backdrop-blur-md sm:p-8">
        <Stave className="w-16 opacity-70" />
        <p className="mt-5 eyebrow text-gold">Secure enrolment</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-paper sm:text-3xl">
          {name ? `${name} · ${planName}` : planName}
        </h1>

        {monthly > 0 && (
          <>
            <p className="mt-3 text-sm text-paper/60">Monthly fee · 8 classes</p>
            <p className="font-display text-2xl font-semibold text-paper">{inr(monthly)}<span className="text-base font-normal text-paper/60"> / month</span></p>

            {/* Pro-rata first payment */}
            <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/[0.06] p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-gold">Pay now to enrol</p>
              <p className="mt-1 font-display text-4xl font-semibold text-gold">{inr(payNow)}</p>
              {prorated && pr ? (
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  Pro-rated for the <b className="text-paper">{pr.remainingDays} days</b> left this month.
                  Your next payment of <b className="text-paper">{inr(monthly)}</b> is due on <b className="text-paper">{pr.nextDueLabel}</b>, and on the 1st of every month after.
                </p>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-paper/80">
                  This covers your first month. Future payments are due on the 1st of each month.
                </p>
              )}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-paper/60">
              Your 8 classes are to be completed within <b className="text-paper/80">35 days (5 weeks)</b> of your start date. Full course details are on your programme page.
            </p>
          </>
        )}

        <p className="mt-5 text-sm leading-relaxed text-paper/75">
          You&apos;ll complete payment on Cashfree&apos;s secure page - enter your name, phone, and the amount
          {payNow > 0 ? ` (${inr(payNow)})` : ""} there.
        </p>

        <div className="mt-5">
          <Button href={CASHFREE_FORM_URL} external fullWidth size="lg" variant="light">
            Pay {payNow > 0 ? inr(payNow) : ""} securely with Cashfree
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
