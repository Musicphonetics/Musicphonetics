"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Stave } from "@/components/ui/Stave";

// Plan list prices (₹/month). A custom amt param overrides — the owner shares
// personalised links (incl. via FORM_LINK) with new and existing students.
const PLAN_AMOUNTS: Record<string, { name: string; amount: number }> = {
  foundation: { name: "Foundation", amount: 12000 },
  signature: { name: "Signature", amount: 18000 },
  "directors-circle": { name: "Director's Circle", amount: 28000 },
};

const SDK_SRC = "https://sdk.cashfree.com/js/v3/cashfree.js";

function loadCashfree(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.Cashfree) return resolve(w.Cashfree);
    const s = document.createElement("script");
    s.src = SDK_SRC;
    s.onload = () => (w.Cashfree ? resolve(w.Cashfree) : reject(new Error("SDK missing")));
    s.onerror = () => reject(new Error("SDK failed to load"));
    document.head.appendChild(s);
  });
}

export function PayClient() {
  const params = useSearchParams();
  const planKey = (params.get("plan") || "custom").toLowerCase();
  const plan = PLAN_AMOUNTS[planKey];
  const amtParam = Math.round(Number(params.get("amt") || ""));
  const amount = Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount ?? 0;
  const planName = plan?.name ?? "Musicphonetics classes";

  const [name, setName] = useState(params.get("name") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const phoneOk = phone.replace(/\D/g, "").length >= 10;
  const ready = name.trim().length >= 2 && phoneOk && amount >= 500;

  async function pay() {
    if (!ready) {
      setStatus("error");
      setErrorMsg("Please enter your name and a valid 10-digit phone number.");
      return;
    }
    setStatus("sending");
    setErrorMsg("");
    try {
      const res = await fetch("/api/cashfree/create-order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planKey, amount, name: name.trim(), phone }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) throw new Error(data.error || "Could not start the payment.");
      const Cashfree = await loadCashfree();
      const cashfree = Cashfree({ mode: data.mode });
      await cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_self" });
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  const field =
    "min-h-[52px] w-full rounded-2xl border border-white/15 bg-white/5 px-5 text-base text-paper placeholder:text-paper/40 focus:border-gold/50 focus:outline-none";

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-7 shadow-card-hover backdrop-blur-md sm:p-8">
        <Stave className="w-16 opacity-70" />
        <p className="mt-5 eyebrow text-gold">Secure payment</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-paper sm:text-3xl">{planName}</h1>
        <p className="mt-1 font-display text-4xl font-semibold text-gold">
          ₹{amount.toLocaleString("en-IN")}
        </p>
        {plan && <p className="mt-1 text-sm text-paper/60">per month · 8 classes</p>}

        <div className="mt-7 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper/80">Full name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className={field} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-paper/80">Phone / WhatsApp</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91…" inputMode="tel" className={field} />
          </label>
        </div>

        {status === "error" && (
          <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
            <p className="font-semibold">{errorMsg}</p>
            <p className="mt-1 text-red-200/80">
              Please try again — or <Link href="/support" className="font-semibold text-gold underline underline-offset-2">get help</Link>.
            </p>
          </div>
        )}

        <div className="mt-6">
          <Button type="button" onClick={pay} fullWidth size="lg" variant="light" className={status === "sending" ? "pointer-events-none opacity-70" : ""}>
            {status === "sending" ? "Opening secure checkout…" : "Pay securely with Cashfree"}
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
