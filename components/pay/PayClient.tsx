"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Stave } from "@/components/ui/Stave";
import { InstrumentIcon } from "@/components/ui/InstrumentIcon";
import { INSTRUMENTS, EXPERIENCE, MODES } from "@/lib/onboarding";
import { WEEK_DAYS, saveEnrolment } from "@/lib/enrolment";
import { computeProrata, SCHEDULE_POLICY, BILLING_POLICY, TERMS_AGREED } from "@/lib/policy";
import { loadRazorpay, createOrder, verifyPayment } from "@/lib/razorpay";
import { getSupabase } from "@/lib/supabase/client";
import { normalizeCode } from "@/lib/coupon";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

// Razorpay Standard Checkout. The order is created server-side by the Pages
// Function /api/razorpay/create-order and verified by /api/razorpay/verify-payment;
// the key SECRET never reaches this file.

const PLAN_AMOUNTS: Record<string, { name: string; amount: number }> = {
  foundation: { name: "Foundation", amount: 10000 },
  main: { name: "Main Musicphonetics Pathway", amount: 15000 },
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
  const listMonthly = Number.isFinite(amtParam) && amtParam > 0 ? amtParam : plan?.amount ?? 0;
  const planName = plan?.name ?? "Musicphonetics classes";

  // The enrolment form - the same details we capture in "Start now", now tied
  // to payment so the welcome document reflects the family's own choices.
  const [name, setName] = useState(params.get("name") || "");
  const [phone, setPhone] = useState(params.get("phone") || "");
  const [email, setEmail] = useState(params.get("email") || "");
  const [instrument, setInstrument] = useState(params.get("instrument") || "");
  const [level, setLevel] = useState("");
  const [mode, setMode] = useState("");
  const [area, setArea] = useState("");
  const [days, setDays] = useState<string[]>([]);
  const [startDate, setStartDate] = useState(todayISO());
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);
  const [leadBusy, setLeadBusy] = useState(false);
  // The form doubles as our lead form — it's the primary action; payment is
  // optional. "form" = filling it in, "trial_done" = free-trial request sent.
  const [view, setView] = useState<"form" | "trial_done">("form");
  const [error, setError] = useState<string | null>(null);
  // Two-step booking: 1 = details, 2 = read the terms and pay.
  const [step, setStep] = useState<1 | 2>(1);
  // Optional teacher coupon (codes only) — validated on the server via RPC, and
  // re-validated again at order creation so the discount can't be spoofed.
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | null>(null);
  const [discountPct, setDiscountPct] = useState(0);
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);

  const monthly = Math.max(0, Math.round(listMonthly * (1 - discountPct / 100)));

  async function applyCouponCode() {
    const clean = normalizeCode(couponInput);
    if (clean.length < 3) { setCouponMsg("Enter a valid code."); return; }
    setCouponBusy(true); setCouponMsg(null);
    try {
      const { data, error } = await getSupabase().rpc("mp_validate_coupon", { p_code: clean });
      const row = Array.isArray(data) ? data[0] : data;
      if (error || !row?.valid) { setDiscountPct(0); setCouponCode(null); setCouponMsg("That code isn’t valid."); }
      else { setDiscountPct(Number(row.discount_percent) || 0); setCouponCode(clean); setCouponMsg(`Applied: ${row.discount_percent}% off${row.teacher_name ? ` · ${row.teacher_name}` : ""}.`); }
    } catch { setCouponMsg("Couldn’t check that code. Try again."); }
    setCouponBusy(false);
  }
  function clearCoupon() { setCouponCode(null); setDiscountPct(0); setCouponInput(""); setCouponMsg(null); }

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

  const phoneOk = /^[6-9]\d{9}$/.test(phone.replace(/\D/g, ""));
  const emailOk = !email.trim() || /^\S+@\S+\.\S+$/.test(email.trim());
  // Enough to be a real lead: who + a way to reach them + an instrument.
  const detailsReady = Boolean(name.trim() && phoneOk && emailOk && instrument);
  const ready = detailsReady && agreed && payNow > 0;

  // Save the lead to the CRM (DB-first) — the PRIMARY action for both paths.
  async function submitLead(intent: "trial" | "pay"): Promise<boolean> {
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          student_name: name.trim(),
          parent_name: name.trim(),
          phone: phone.replace(/\D/g, ""),
          email: email.trim() || undefined,
          instrument_interest: instrument,
          preferred_mode: mode || undefined,
          preferred_area: area.trim() || undefined,
          experience_level: level || undefined,
          preferred_days: days.join(", ") || undefined,
          preferred_program: planName,
          coupon_code: couponCode ?? undefined,
          message: intent === "trial"
            ? `Requested a FREE TRIAL for ${planName}. Preferred start ${startDate}.`
            : `Enrolment (paying) for ${planName}. Preferred start ${startDate}.`,
          source: "website",
          landing_page: "/pay",
          botcheck: "",
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean };
      return !!(res.ok && data.ok);
    } catch { return false; }
  }

  // "Book a free trial" — no payment. Save the lead, show the confirmation.
  async function bookTrial() {
    if (!detailsReady || leadBusy) return;
    setError(null); setLeadBusy(true);
    const ok = await submitLead("trial");
    setLeadBusy(false);
    if (ok) { setView("trial_done"); window.scrollTo({ top: 0, behavior: "smooth" }); }
    else setError("Couldn't send your request. Please check your details and try again.");
  }

  function goToTerms() {
    if (!detailsReady) return;
    setError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "auto" });
  }
  function backToDetails() {
    setStep(1);
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  async function proceed() {
    if (!ready || paying) return;
    setError(null);
    setPaying(true);

    // Capture the lead FIRST — so even if they abandon checkout, we have them.
    await submitLead("pay");

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
        plan_key: planKey,
        coupon_code: couponCode ?? undefined,
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

  if (view === "trial_done") return <TrialDone name={name} planName={planName} instrument={instrument} phone={phone} />;

  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-6 shadow-card-hover backdrop-blur-md sm:p-8">
        <Stave className="w-16 opacity-70" />
        <p className="mt-5 eyebrow text-gold">{step === 1 ? "Step 1 of 2 · Your details" : "Step 2 of 2 · Terms & your choice"}</p>
        <h1 className="mt-2 font-display text-2xl font-semibold text-paper sm:text-3xl">{planName}</h1>
        {monthly > 0 && (
          <p className="mt-1 text-sm text-paper/70">
            {discountPct > 0 && <span className="mr-2 text-paper/40 line-through">{inr(listMonthly)}</span>}
            <b className="text-paper">{inr(monthly)}</b> / month · 8 classes · one hour each
            {discountPct > 0 && <span className="ml-2 rounded-full bg-gold/20 px-2 py-0.5 text-xs font-semibold text-gold">{discountPct}% off</span>}
          </p>
        )}

        {step === 1 && (
        <>
        {/* Optional coupon */}
        {listMonthly > 0 && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3">
            {couponCode ? (
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="text-paper/80">Coupon <b className="font-mono text-gold">{couponCode}</b> applied — {discountPct}% off</span>
                <button type="button" onClick={clearCoupon} className="text-xs font-semibold text-paper/50 hover:text-paper">Remove</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <input value={couponInput} onChange={(e) => setCouponInput(normalizeCode(e.target.value))}
                  placeholder="Coupon code (optional)"
                  className="min-w-0 flex-1 rounded-xl border border-white/15 bg-transparent px-3 py-2.5 font-mono text-sm uppercase text-paper placeholder:text-paper/35 focus:outline-none" />
                <button type="button" disabled={couponBusy} onClick={applyCouponCode}
                  className="shrink-0 rounded-xl bg-gold px-4 py-2.5 text-sm font-semibold text-ink disabled:opacity-50">{couponBusy ? "…" : "Apply"}</button>
              </div>
            )}
            {couponMsg && <p className={cn("mt-1.5 text-xs", couponCode ? "text-feature-green" : "text-red-300")}>{couponMsg}</p>}
          </div>
        )}
        </>
        )}

        {step === 1 && (
        <>
        {/* Student name */}
        <Group n={1} label="Who is enrolling?">
          <input
            value={name} onChange={(e) => setName(e.target.value)}
            aria-label="Student's full name"
            placeholder="Student's full name"
            className="w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none"
          />
        </Group>

        {/* Contact — needed so we can reach you */}
        <Group n={2} label="How can we reach you?">
          <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] focus-within:outline-2 focus-within:outline-gold">
            <span className="flex items-center border-r border-white/15 px-3 text-sm text-paper/55">+91</span>
            <input value={phone} inputMode="numeric" autoComplete="tel-national"
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              aria-label="WhatsApp number" placeholder="WhatsApp number"
              className="w-full bg-transparent px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:outline-none" />
          </div>
          {phone.length > 0 && !phoneOk && <p className="mt-1.5 text-xs text-red-300">Enter a valid 10-digit mobile (starts 6–9).</p>}
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" autoComplete="email"
            aria-label="Email (optional)" placeholder="Email (optional)"
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        </Group>

        {/* Instrument */}
        <Group n={3} label="Which instrument?">
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
        <Group n={4} label="Current level" optional>
          <Pills options={EXPERIENCE.map((e) => e.value)} value={level} onPick={setLevel} />
        </Group>

        {/* Mode */}
        <Group n={5} label="Preferred mode & area" optional>
          <Pills options={MODES.map((m) => m.value)} value={mode} onPick={setMode} />
          <input value={area} onChange={(e) => setArea(e.target.value)}
            aria-label="Your area / locality" placeholder="Your area / locality (e.g. Vasant Kunj)"
            className="mt-2 w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        </Group>

        {/* Preferred days (multi) */}
        <Group n={6} label="Preferred days" hint="Pick every day you'd like classes - most students choose two.">
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
        <Group n={7} label="When would you like to start?" hint="Your fee plan is built around this date.">
          <input
            type="date" aria-label="Preferred start date" value={startDate} min={todayISO()} onChange={(e) => setStartDate(e.target.value)}
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

        {/* Continue to the terms step */}
        <button
          type="button" onClick={goToTerms} disabled={!detailsReady}
          className={cn("mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all active:scale-[0.99]",
            detailsReady ? "bg-gold text-ink shadow-card hover:bg-deep-gold" : "cursor-not-allowed bg-white/10 text-paper/40")}>
          {detailsReady ? "Continue — review & choose" : "Fill your details to continue"}
          {detailsReady && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
        </button>
        <p className="mt-2 text-center text-xs text-paper/50">
          {detailsReady ? "Next you’ll see the terms and your price, then choose a free trial or to enrol." : "Name, a valid mobile number and an instrument are needed."}
        </p>
        </>
        )}

        {step === 2 && (
        <>
        {/* Booking summary */}
        <button type="button" onClick={backToDetails} className="mt-6 inline-flex items-center gap-1.5 text-sm text-paper/60 transition-colors hover:text-gold">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          Edit your details
        </button>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-white/12 bg-white/[0.04] p-4 text-sm">
          <SummaryItem label="Student" value={name.trim()} />
          <SummaryItem label="Instrument" value={instrument} />
          <SummaryItem label="Preferred days" value={days.join(", ")} />
          <SummaryItem label="Start date" value={prettyDate(startDate)} />
          {payNow > 0
            ? <SummaryItem label="Fee if you enrol now" value={inr(payNow)} highlight />
            : <SummaryItem label="Free trial" value="No payment to enquire" highlight />}
        </div>

        <h2 className="mt-7 font-display text-xl font-semibold text-paper">The terms, in full</h2>
        <p className="mt-1.5 text-sm leading-relaxed text-paper/70">
          Please read these carefully. When you enrol you are agreeing to them, so we explain everything clearly here before any payment is taken.
        </p>

        {/* Class schedule, explained */}
        <TermsBlock title="How your classes work">
          {SCHEDULE_POLICY.map((s) => <TermsLine key={s}>{s}</TermsLine>)}
        </TermsBlock>

        {/* Fees & billing, explained */}
        <TermsBlock title="Fees and billing">
          {BILLING_POLICY.map((s) => <TermsLine key={s}>{s}</TermsLine>)}
        </TermsBlock>

        {/* The agreement terms */}
        <TermsBlock title="What you're agreeing to">
          {TERMS_AGREED.map((t) => <TermsLine key={t}>{t}</TermsLine>)}
        </TermsBlock>

        {/* Refunds & withdrawal */}
        <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-paper/60">Refunds and withdrawal</p>
          <p className="mt-2.5 text-sm leading-relaxed text-paper/80">
            Fees are billed monthly and in advance. A missed class is rescheduled where possible, subject to teacher availability. To pause or withdraw, tell us before your next billing date and we will stop the next cycle. Completed months are non refundable. There are no hidden charges, and all fees are billed only in the Musicphonetics name through a secure gateway.
          </p>
          <p className="mt-3 text-xs text-paper/55">
            Full documents:{" "}
            <Link href="/enrolment-agreement" target="_blank" className="font-semibold text-gold underline underline-offset-2">Enrolment Agreement</Link>{" · "}
            <Link href="/standards/terms-conditions" target="_blank" className="font-semibold text-gold underline underline-offset-2">Terms &amp; Conditions</Link>{" · "}
            <Link href="/standards/refund-payment" target="_blank" className="font-semibold text-gold underline underline-offset-2">Refund &amp; Payment</Link>.
          </p>
        </div>

        {/* Agreement */}
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-gold" />
          <span className="text-sm leading-relaxed text-paper/90">
            I have read and I agree to the class schedule, fees, refund policy and the{" "}
            <Link href="/enrolment-agreement" target="_blank" className="font-semibold text-gold underline underline-offset-2">Enrolment Agreement &amp; Parent Acknowledgement</Link>{" "}
            above. I understand a login is not issued at payment — I will activate it myself through Student Activation.
          </span>
        </label>

        {/* Two ways to proceed — submitting the form is the goal; paying is optional. */}
        <div className="mt-6 space-y-3">
          <p className="text-center text-sm font-medium text-paper/80">Ready? Choose how you’d like to begin.</p>

          {/* Free trial — primary, NO payment */}
          <button type="button" onClick={bookTrial} disabled={!detailsReady || leadBusy}
            className={cn("inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all active:scale-[0.99]",
              detailsReady && !leadBusy ? "bg-gold text-ink shadow-card hover:bg-deep-gold" : "cursor-not-allowed bg-white/10 text-paper/40")}>
            {leadBusy ? "Sending your request…" : "Book a free trial — no payment"}
          </button>
          <p className="text-center text-xs text-paper/55">Just submit — we’ll contact you to schedule it. No card, no fees to enquire.</p>

          {payNow > 0 && (
            <>
              <div className="flex items-center gap-3 py-1 text-[11px] uppercase tracking-wider text-paper/40">
                <span className="h-px flex-1 bg-white/10" />or enrol &amp; pay now<span className="h-px flex-1 bg-white/10" />
              </div>
              <button type="button" onClick={proceed} disabled={!ready || paying}
                className={cn("inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full border-2 px-6 text-base font-semibold transition-all active:scale-[0.99]",
                  ready && !paying ? "border-gold text-gold hover:bg-gold/10" : "cursor-not-allowed border-white/12 text-paper/40")}>
                {paying ? "Opening secure checkout…" : ready ? `Pay ${inr(payNow)} & enrol` : "Tick “I agree” above to pay"}
              </button>
              <p className="flex items-center justify-center gap-2 text-xs text-paper/55">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-gold"><path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
                Encrypted &amp; secure · UPI, cards &amp; netbanking
              </p>
            </>
          )}
        </div>
        {error && (
          <div role="alert" className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
            {error}
          </div>
        )}
        </>
        )}
      </div>

      <p className="mt-5 text-center text-sm text-paper/60">
        Need help? <Link href="/support" className="font-semibold text-gold underline underline-offset-2">We reply immediately</Link>.
      </p>
    </div>
  );
}

function TrialDone({ name, planName, instrument, phone }: { name: string; planName: string; instrument: string; phone: string }) {
  const first = name.trim().split(" ")[0] || "there";
  const wa = whatsappLink(`Hi Musicphonetics, I just requested a free trial for ${instrument || planName}${name ? ` (${name})` : ""}. Looking forward to hearing about the next step.`);
  return (
    <div className="mx-auto w-full max-w-lg">
      <div className="rounded-3xl border border-white/12 bg-white/[0.05] p-7 text-center shadow-card-hover backdrop-blur-md sm:p-9">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold/15 text-gold">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
        </div>
        <h1 className="mt-6 font-display text-2xl font-semibold text-paper sm:text-3xl">Your free trial request is in, {first}!</h1>
        <p className="mt-3 text-sm leading-relaxed text-paper/70">
          We’ve received your details for <b className="text-paper/90">{instrument || planName}</b>. Our team will reach out shortly to
          confirm a teacher and schedule your <b className="text-paper/90">free trial class</b> — no payment needed.
        </p>
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-left text-sm text-paper/75">
          <p><span className="text-paper/50">What happens next:</span> we match a teacher to your goals, then message you on WhatsApp{phone ? ` at +91 ${phone}` : ""} to lock a time. You only pay once you’re happy after the trial.</p>
        </div>
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="mt-6 inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-gold px-6 text-base font-semibold text-ink shadow-card hover:bg-deep-gold">
          Message us on WhatsApp
        </a>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-paper/60 hover:text-gold">Back to home</Link>
      </div>
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
        {optional && <span className="text-[11px] text-paper/60">optional</span>}
      </div>
      {hint && <p className="mb-2.5 text-xs leading-relaxed text-paper/55">{hint}</p>}
      {children}
    </div>
  );
}

function SummaryItem({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn(highlight && "col-span-2 border-t border-white/10 pt-2.5")}>
      <p className="text-[11px] uppercase tracking-wide text-paper/50">{label}</p>
      <p className={cn("mt-0.5 font-medium", highlight ? "text-lg text-gold" : "text-paper")}>{value || "—"}</p>
    </div>
  );
}

function TermsBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 rounded-2xl border border-white/12 bg-white/[0.03] p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-paper/60">{title}</p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function TermsLine({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-paper/80">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mt-0.5 shrink-0 text-gold"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span>{children}</span>
    </li>
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
