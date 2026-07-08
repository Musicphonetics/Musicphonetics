"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stave } from "@/components/ui/Stave";
import { InstrumentIcon } from "@/components/ui/InstrumentIcon";
import { INSTRUMENTS, EXPERIENCE, MODES } from "@/lib/onboarding";
import { WEEK_DAYS, saveEnrolment } from "@/lib/enrolment";
import { computeProrata, SCHEDULE_POLICY, TERMS_AGREED } from "@/lib/policy";
import { loadRazorpay, createOrder, verifyPayment } from "@/lib/razorpay";
import { cn } from "@/lib/utils";

// Razorpay Standard Checkout. The order is created server-side by the Pages
// Function /api/razorpay/create-order and verified by /api/razorpay/verify-payment;
// the key SECRET never reaches this file.

const PLAN_AMOUNTS: Record<string, { name: string; amount: number }> = {
  foundation: { name: "Foundation", amount: 8000 },
  main: { name: "Main Musicphonetics Pathway", amount: 12000 },
  "directors-circle": { name: "Director's Circle", amount: 28000 },
};

const inr = (n: number) => "₹" + n.toLocaleString("en-IN");
const todayISO = () => new Date().toISOString().slice(0, 10);
const prettyDate = (iso: string) =>
  new Date(iso + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "long" });

export function PayClient() {
  const params = useSearchParams();
  const planKey = (params.get("plan") || "").toLowerCase();
  const plan = PLAN_AMOUNTS[planKey];
  const amtParam = Math.round(Number(params.get("amt") || ""));
  const monthly = Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount ?? 0;
  const planName = plan?.name ?? "Musicphonetics classes";

  // The enrolment form - the same details we capture in "Start now", now tied
  // to payment so the welcome document reflects the family's own choices.
  const [name, setName] = useState(params.get("name") || "");
  const [instrument, setInstrument] = useState(params.get("instrument") || "");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(todayISO());
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Warm up the Razorpay script as soon as the page loads, so the pay click is
  // instant and any load problem shows up before the customer commits.
  useEffect(() => { loadRazorpay(); }, []);

  const toggleDay = (d: string) =>
    setDays((cur) => (cur.includes(d) ? cur.filter((x) => x !== d) : [...cur, d]));

  // Pro-rata plan for the chosen start date.
  const pr = useMemo(
    () => (monthly > 0 ? computeProrata(monthly, new Date(startDate + "T00:00:00")) : null),
    [monthly, startDate]
  );
  // Starting on the 1st or 2nd = effectively a full month; avoid odd rounding.
  const prorated = pr ? pr.day > 2 : false;
  const payNow = pr ? (prorated ? pr.firstPayment : monthly) : 0;

  const detailsReady = Boolean(name.trim() && instrument && days.length > 0 && startDate);
  const ready = detailsReady && agreed && payNow > 0;

  async function proceed() {
    if (!ready || paying) return;
    setError(null);
    setPaying(true);

    // Save the enrolment first so /welcome can show the confirmation on success.
    const now = new Date().toISOString();
    saveEnrolment({
      planKey, planName, monthly, name: name.trim(), instrument, level, mode, days,
      startDate, firstPayment: payNow, agreedAt: now, savedAt: now,
    });

    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        throw new Error("Could not load the secure checkout. Check your connection and try again.");
      }

      const order = await createOrder({
        amount: Math.round(payNow * 100), // paise
        currency: "INR",
        receipt: `mp_${Date.now()}`,
        plan: planName,
        name: name.trim(),
      });

      const key = order.key_id || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!key) throw new Error("Payments are not configured yet. Please reach us on WhatsApp.");

      const rzp = new window.Razorpay({
        key,
        order_id: order.order_id,
        amount: order.amount,
        currency: order.currency,
        name: "Musicphonetics",
        description: `${planName} · enrolment`,
        prefill: { name: name.trim() },
        notes: { plan: planName, instrument },
        theme: { color: "#C9A227" },
        handler: async (resp: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            const v = await verifyPayment(resp);
            if (v.ok && v.verified) {
              window.location.href = "/welcome";
            } else {
              setPaying(false);
              setError(`We received your payment but could not verify it automatically. Please message us on WhatsApp with payment id ${resp.razorpay_payment_id} and we'll confirm right away.`);
            }
          } catch {
            setPaying(false);
            setError(`Payment done but verification did not complete. Please message us on WhatsApp with payment id ${resp.razorpay_payment_id}.`);
          }
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            setError(null); // user simply closed the window - no error shown
          },
        },
      });

      rzp.on("payment.failed", (r: { error?: { description?: string } }) => {
        setPaying(false);
        setError(r?.error?.description || "The payment failed. Please try again or use another method.");
      });

      rzp.open();
    } catch (e) {
      setPaying(false);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-card-hover backdrop-blur-md sm:p-8">
        <Stave className="w-16 opacity-70" />
        <p className="mt-5 eyebrow text-gold">Enrol &amp; pay</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-paper sm:text-3xl">{planName}</h1>
        {monthly > 0 && (
          <p className="mt-1 text-sm text-paper/70">
            <b className="text-paper">{inr(monthly)}</b> / month · 8 classes · one hour each
          </p>
        )}

        {/* Student name */}
        <Group n={1} label="Who is enrolling?">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Student's full name"
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none"
          />
        </Group>

        {/* Instrument */}
        <Group n={2} label="Which instrument?">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {INSTRUMENTS.map((o) => (
              <button key={o.value} type="button" onClick={() => setInstrument(o.value)}
                className={cn("flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all active:scale-[0.98]",
                  instrument === o.value ? "border-gold bg-gold/10 text-paper" : "border-white/12 text-paper/75 hover:border-white/30")}>
                <span className={cn("shrink-0", instrument === o.value ? "text-gold" : "text-paper/50")}>
                  <InstrumentIcon name={o.icon} size={16} />
                </span>
                {o.label}
              </button>
            ))}
          </div>
        </Group>

        {/* Level */}
        <Group n={3} label="Current level" optional>
          <Pills options={EXPERIENCE.map((e) => e.value)} value={level} onPick={setLevel} />
        </Group>

        {/* Mode */}
        <Group n={4} label="Preferred mode" optional>
          <Pills options={MODES.map((m) => m.value)} value={mode} onPick={setMode} />
        </Group>

        {/* Preferred days (multi) */}
        <Group n={5} label="Preferred days" hint="Pick every day you'd like classes - most students choose two.">
          <div className="flex flex-wrap gap-2">
            {WEEK_DAYS.map((d) => (
              <button key={d} type="button" onClick={() => toggleDay(d)}
                className={cn("rounded-full border px-4 py-2 text-sm transition-all active:scale-[0.98]",
                  days.includes(d) ? "border-gold bg-gold text-ink font-semibold" : "border-white/15 text-paper/75 hover:border-white/30")}>
                {d}
              </button>
            ))}
          </div>
        </Group>

        {/* Start date */}
        <Group n={6} label="When would you like to start?" hint="Your fee plan is built around this date.">
          <input
            type="date" value={startDate} min={todayISO()} onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-paper [color-scheme:dark] focus-visible:outline-2 focus-visible:outline-gold focus:outline-none"
          />
        </Group>

        {/* The pro-rata plan, explained */}
        {pr && monthly > 0 && (
          <div className="mt-7 rounded-2xl border border-gold/30 bg-gold/[0.05] p-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-gold">Your fee plan</p>

            {/* Step 1 - first payment */}
            <PlanRow
              tag="Pay now to enrol"
              amount={inr(payNow)}
              detail={prorated
                ? `Pro-rated for the ${pr.remainingDays} days from your ${prettyDate(startDate)} start to the end of the month. You only pay for the part of the month you'll actually attend.`
                : `Covers your first full month of 8 classes, starting ${prettyDate(startDate)}.`}
              highlight
            />
            {/* Step 2 - recurring */}
            <PlanRow
              tag={`Then from ${pr.nextDueLabel}`}
              amount={inr(monthly)}
              detail={`A simple flat fee for 8 classes, due on the 1st of every month. No surprises, no random amounts.`}
            />

            <p className="mt-4 border-t border-white/10 pt-4 text-xs leading-relaxed text-paper/70">
              <b className="text-paper/85">Why it works this way:</b> we align fees to the calendar month so your
              billing date never drifts. Because you start on {prettyDate(startDate)}, your first payment only covers
              the remaining days of this month{prorated ? ` (${pr.remainingDays} days)` : ""}. After that it&apos;s the
              same amount on the same date each month - easy to plan for. Your 8 classes are always to be completed
              within <b className="text-paper/85">35 days</b> of the cycle start.
            </p>
          </div>
        )}

        {/* Please read before paying - class schedule */}
        <div className="mt-7 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper/60">Please read before you pay · Class schedule</p>
          <ul className="mt-3 space-y-2">
            {SCHEDULE_POLICY.map((s) => (
              <li key={s} className="flex items-start gap-2.5 text-sm leading-relaxed text-paper/80">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                {s}
              </li>
            ))}
          </ul>
        </div>

        {/* Terms & conditions */}
        <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper/60">Terms &amp; conditions</p>
          <ol className="mt-3 space-y-2">
            {TERMS_AGREED.map((t, i) => (
              <li key={t} className="flex gap-2.5 text-sm leading-relaxed text-paper/80">
                <span className="font-semibold text-gold">{i + 1}.</span> {t}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs text-paper/55">
            Full documents:{" "}
            <Link href="/standards/terms-conditions" className="font-semibold text-gold underline underline-offset-2">Terms &amp; Conditions</Link>{" · "}
            <Link href="/standards/refund-payment" className="font-semibold text-gold underline underline-offset-2">Refund &amp; Payment</Link>.
          </p>
        </div>

        {/* Agreement */}
        <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-gold" />
          <span className="text-sm leading-relaxed text-paper/85">
            I have read and agree to the class schedule, fees and terms &amp; conditions above.
          </span>
        </label>

        {/* Pay */}
        <button
          type="button" onClick={proceed} disabled={!ready || paying}
          className={cn("mt-5 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all active:scale-[0.99]",
            ready && !paying ? "bg-gold text-ink shadow-card hover:bg-deep-gold" : "cursor-not-allowed bg-white/10 text-paper/40")}>
          {paying
            ? "Opening secure checkout…"
            : ready
              ? `Pay ${payNow > 0 ? inr(payNow) : ""} securely`
              : !detailsReady ? "Fill your details to continue" : "Tick the box to agree and continue"}
        </button>
        {!detailsReady && !paying && (
          <p className="mt-2 text-center text-xs text-paper/50">Name, instrument, at least one day and a start date are needed.</p>
        )}
        {error && (
          <div role="alert" className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}

        <p className="mt-4 flex items-center justify-center gap-2 text-xs text-paper/60">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold">
            <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
          Encrypted &amp; secure · UPI, cards &amp; netbanking
        </p>
        <p className="mt-3 text-center text-xs leading-relaxed text-paper/50">
          A secure payment window opens for {payNow > 0 ? inr(payNow) : "your amount"}. Your details above
          are saved, so your welcome document is ready the moment payment succeeds.
        </p>
      </div>

      <p className="mt-5 text-center text-sm text-paper/60">
        Need help? <Link href="/support" className="font-semibold text-gold underline underline-offset-2">We reply immediately</Link>.
      </p>
    </div>
  );
}

function Group({ n, label, hint, optional, children }: {
  n: number; label: string; hint?: string; optional?: boolean; children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <div className="mb-2.5 flex items-baseline gap-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-gold/15 text-[11px] font-semibold text-gold">{n}</span>
        <label className="text-sm font-semibold text-paper">{label}</label>
        {optional && <span className="text-[11px] text-paper/45">optional</span>}
      </div>
      {hint && <p className="mb-2.5 text-xs leading-relaxed text-paper/55">{hint}</p>}
      {children}
    </div>
  );
}

function Pills({ options, value, onPick }: { options: string[]; value: string; onPick: (v: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onPick(value === o ? "" : o)}
          className={cn("rounded-full border px-4 py-2 text-sm transition-all active:scale-[0.98]",
            value === o ? "border-gold bg-gold/10 text-paper" : "border-white/15 text-paper/75 hover:border-white/30")}>
          {o}
        </button>
      ))}
    </div>
  );
}

function PlanRow({ tag, amount, detail, highlight }: { tag: string; amount: string; detail: string; highlight?: boolean }) {
  return (
    <div className={cn("mt-3 first:mt-3", highlight ? "" : "")}>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-paper/60">{tag}</p>
        <p className={cn("font-display font-semibold", highlight ? "text-2xl text-gold" : "text-lg text-paper")}>{amount}</p>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-paper/70">{detail}</p>
    </div>
  );
}
