"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { whatsappLink } from "@/lib/data";
import {
  DELHI_CANTT, offerIsLive, OFFER_REGULAR, OFFER_PRICE, OFFER_SAVE,
  CANTT_AGE_GROUPS, CANTT_INSTRUMENTS, CANTT_MODES, canttWhatsappMessage,
} from "@/lib/delhi-cantt";
import { cn } from "@/lib/utils";

type View = "hero" | "form" | "success";

interface Answers {
  learner_name: string;
  age_group: string;
  instrument: string;
  mode: string;
  area: string;
  enquirer_name: string;
  phone: string;      // 10 digits (no +91)
  email: string;
  goal: string;
}
const EMPTY: Answers = {
  learner_name: "", age_group: "", instrument: "", mode: "",
  area: "", enquirer_name: "", phone: "", email: "", goal: "",
};

const validPhone = (v: string) => /^[6-9]\d{9}$/.test(v.replace(/\D/g, ""));

export function DelhiCanttLanding() {
  const live = offerIsLive();
  const params = useSearchParams();
  const utm = useMemo(() => ({
    utm_source: params.get("utm_source") || "",
    utm_medium: params.get("utm_medium") || "",
    utm_campaign: params.get("utm_campaign") || "",
    utm_content: params.get("utm_content") || "",
  }), [params]);

  const [view, setView] = useState<View>("hero");
  const [step, setStep] = useState(0);
  const [a, setA] = useState<Answers>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submittedRef = useRef(false);          // guard against duplicate submits
  const botRef = useRef<HTMLInputElement>(null); // honeypot

  const set = (k: keyof Answers, v: string) => setA((p) => ({ ...p, [k]: v }));

  const steps = [
    { title: "The learner", valid: () => a.learner_name.trim().length >= 2 && !!a.age_group && !!a.instrument },
    { title: "Preferences", valid: () => !!a.mode && a.area.trim().length >= 2 },
    { title: "Your details", valid: () => a.enquirer_name.trim().length >= 2 && validPhone(a.phone) },
  ];

  function openForm() { setView("form"); setStep(0); setError(null); window.scrollTo({ top: 0, behavior: "smooth" }); }

  async function submit() {
    if (submitting || submittedRef.current) return;
    if (!steps[2].valid()) { setError("Please enter the enquirer name and a valid WhatsApp number."); return; }
    setSubmitting(true); setError(null);
    try {
      const res = await fetch("/api/delhi-cantt-lead", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          ...a,
          phone: a.phone.replace(/\D/g, ""),
          botcheck: botRef.current?.value || "",
          ...utm,
        }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      submittedRef.current = true;
      setSubmitting(false);
      setView("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      setSubmitting(false);
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    }
  }

  // ---------------------------------------------------------------- shells --
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[520px] flex-col px-5 pb-16 pt-6 text-paper">
      <header className="flex items-center justify-between">
        <Link href="/" aria-label="Musicphonetics home" className="inline-flex">
          <Image src="/logo-wordmark-light.webp" alt="Musicphonetics" width={163} height={30} priority className="h-7 w-auto" />
        </Link>
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold-soft">Delhi Cantt</span>
      </header>

      {view === "hero" && <Hero live={live} onClaim={openForm} />}
      {view === "form" && (
        <FormView
          a={a} set={set} step={step} steps={steps} setStep={setStep}
          submitting={submitting} error={error} onSubmit={submit} botRef={botRef}
        />
      )}
      {view === "success" && <Success a={a} />}

      <footer className="mt-auto pt-10 text-center">
        <p className="text-[11px] leading-relaxed text-paper/40">{DELHI_CANTT.eligibilityNote}</p>
        <p className="mt-3 text-[11px] text-paper/35">
          Musicphonetics · GST Registered · Udyam Registered · Trademarked Brand · Secure Company Payments
        </p>
      </footer>
    </main>
  );
}

/* ============================ HERO ============================ */
function Hero({ live, onClaim }: { live: boolean; onClaim: () => void }) {
  return (
    <div className="animate-fade-up">
      <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-soft">Delhi Cantt Launch Benefit</p>
      <h1 className="mt-3 font-display text-[40px] font-semibold leading-[1.03] tracking-tight text-paper sm:text-[46px]">
        Give their musical journey the <span className="text-gold-soft">right beginning.</span>
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-paper/70">
        Structured music lessons with carefully selected teachers — clear learning direction, homework, attendance
        tracking and regular parent updates.
      </p>

      {/* Offer card */}
      <div className="mt-7 rounded-2xl border border-gold/30 bg-gradient-to-b from-gold/[0.08] to-transparent p-5">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-gold-soft">Main Pathway</span>
          <span className="rounded-full bg-forest/30 px-2.5 py-1 text-[10px] font-semibold text-gold-soft">
            {DELHI_CANTT.classesPerMonth} classes / month
          </span>
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="font-display text-[54px] font-semibold leading-none text-gold-soft" style={{ fontVariantNumeric: "tabular-nums" }}>
            {OFFER_PRICE}
          </span>
          <span className="pb-2 text-sm text-paper/60">/ month</span>
        </div>
        <div className="mt-1 flex items-center gap-3">
          <span className="text-lg text-paper/45 line-through decoration-gold/70 decoration-2" style={{ fontVariantNumeric: "tabular-nums" }}>
            {OFFER_REGULAR}
          </span>
          <span className="rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold text-gold-soft">Save {OFFER_SAVE}</span>
        </div>
        <hr className="my-4 border-white/10" />
        <p className="text-[13px] text-paper/70">{DELHI_CANTT.instrumentsLine}</p>
      </div>

      {live ? (
        <>
          <button
            onClick={onClaim}
            className="mt-6 w-full rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink transition hover:bg-gold-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold-soft"
          >
            Claim Delhi Cantt Benefit
          </button>
          <p className="mt-2 text-center text-xs text-paper/50">Takes less than 45 seconds. No payment required.</p>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center">
          <p className="text-sm text-paper/70">This launch benefit has closed for now.</p>
          <a href={whatsappLink("Hi Musicphonetics, is the Delhi Cantt offer still available?")} target="_blank" rel="noopener noreferrer"
            className="mt-3 inline-block rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink">Ask us on WhatsApp</a>
        </div>
      )}

      <ul className="mt-7 grid grid-cols-1 gap-2.5">
        {["Carefully matched teachers", "Structured monthly learning", "Parent visibility and updates"].map((t) => (
          <li key={t} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-sm text-paper/80">
            <Check /> {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ============================ FORM ============================ */
function FormView({
  a, set, step, steps, setStep, submitting, error, onSubmit, botRef,
}: {
  a: Answers; set: (k: keyof Answers, v: string) => void;
  step: number; steps: { title: string; valid: () => boolean }[]; setStep: (n: number) => void;
  submitting: boolean; error: string | null; onSubmit: () => void; botRef: React.RefObject<HTMLInputElement>;
}) {
  const last = step === steps.length - 1;
  const canNext = steps[step].valid();
  const pct = Math.round(((step + 1) / steps.length) * 100);

  return (
    <div className="animate-fade-up">
      <div className="mt-8 flex items-center justify-between">
        <p className="font-display text-xl font-semibold text-paper">{steps[step].title}</p>
        <span className="text-xs text-paper/50">Step {step + 1} of {steps.length}</span>
      </div>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-gold-soft transition-all" style={{ width: `${pct}%` }} />
      </div>

      {/* honeypot (visually hidden, not tab-focusable) */}
      <input ref={botRef} type="text" name="botcheck" tabIndex={-1} autoComplete="off" aria-hidden="true"
        className="absolute left-[-9999px] h-0 w-0 opacity-0" />

      <div className="mt-6 space-y-5">
        {step === 0 && (
          <>
            <Field label="Learner's first name" htmlFor="learner">
              <input id="learner" value={a.learner_name} onChange={(e) => set("learner_name", e.target.value)}
                placeholder="e.g. Aarav" autoComplete="off" className={inputCls} />
            </Field>
            <Choice label="Age group" options={CANTT_AGE_GROUPS} value={a.age_group} onChange={(v) => set("age_group", v)} />
            <Choice label="Instrument" options={CANTT_INSTRUMENTS} value={a.instrument} onChange={(v) => set("instrument", v)} />
          </>
        )}
        {step === 1 && (
          <>
            <Choice label="Preferred mode" options={CANTT_MODES} value={a.mode} onChange={(v) => set("mode", v)} />
            <Field label="Delhi Cantt area / nearby locality" htmlFor="area">
              <input id="area" value={a.area} onChange={(e) => set("area", e.target.value)}
                placeholder="e.g. Dhaula Kuan, Sadar Bazar, Naraina" autoComplete="off" className={inputCls} />
            </Field>
          </>
        )}
        {step === 2 && (
          <>
            <Field label="Parent / enquirer name" htmlFor="enquirer">
              <input id="enquirer" value={a.enquirer_name} onChange={(e) => set("enquirer_name", e.target.value)}
                placeholder="Your name" autoComplete="name" className={inputCls} />
            </Field>
            <Field label="WhatsApp number" htmlFor="phone">
              <div className="flex items-stretch overflow-hidden rounded-xl border border-white/15 bg-white/[0.04] focus-within:border-gold/60">
                <span className="flex items-center border-r border-white/15 px-3 text-sm text-paper/60">+91</span>
                <input id="phone" inputMode="numeric" value={a.phone}
                  onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                  placeholder="10-digit mobile" autoComplete="tel-national"
                  className="w-full bg-transparent px-3 py-3 text-[15px] text-paper placeholder:text-paper/35 focus:outline-none" />
              </div>
              {a.phone.length > 0 && !validPhone(a.phone) && (
                <p className="mt-1.5 text-xs text-red-300">Enter a valid 10-digit Indian mobile (starts 6–9).</p>
              )}
            </Field>
            <Field label="Email (optional)" htmlFor="email">
              <input id="email" type="email" value={a.email} onChange={(e) => set("email", e.target.value)}
                placeholder="you@email.com" autoComplete="email" className={inputCls} />
            </Field>
            <Field label="Learning goal (optional)" htmlFor="goal">
              <textarea id="goal" value={a.goal} onChange={(e) => set("goal", e.target.value)} rows={2}
                placeholder="e.g. build a strong foundation, exam prep, play for fun" className={cn(inputCls, "resize-none")} />
            </Field>
          </>
        )}
      </div>

      {error && <p className="mt-4 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}

      <div className="mt-7 flex items-center gap-3">
        {step > 0 && (
          <button onClick={() => setStep(step - 1)} disabled={submitting}
            className="rounded-full border border-white/15 px-5 py-3.5 text-sm font-semibold text-paper/70 disabled:opacity-50">Back</button>
        )}
        {!last ? (
          <button onClick={() => canNext && setStep(step + 1)} disabled={!canNext}
            className="flex-1 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-40 disabled:hover:bg-gold">
            Continue
          </button>
        ) : (
          <button onClick={onSubmit} disabled={!canNext || submitting}
            className="flex-1 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-gold-soft disabled:opacity-40 disabled:hover:bg-gold">
            {submitting ? "Sending…" : "Get My Teacher Recommendation"}
          </button>
        )}
      </div>
      <p className="mt-3 text-center text-xs text-paper/45">No payment required · we’ll reply on WhatsApp.</p>
    </div>
  );
}

/* ============================ SUCCESS ============================ */
function Success({ a }: { a: Answers }) {
  const wa = whatsappLink(canttWhatsappMessage({
    name: a.learner_name, age: a.age_group, instrument: a.instrument, mode: a.mode, area: a.area,
  }));
  return (
    <div className="animate-fade-up flex flex-1 flex-col items-center justify-center py-10 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-forest/30">
        <svg viewBox="0 0 24 24" className="h-8 w-8 text-gold-soft" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
      </div>
      <h2 className="mt-6 font-display text-[30px] font-semibold leading-tight text-paper">Your Delhi Cantt benefit is reserved.</h2>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-paper/70">
        We’ll review the learner’s age, instrument, locality and goals, then contact you with the most suitable teacher and next step.
      </p>
      <a href={wa} target="_blank" rel="noopener noreferrer"
        className="mt-7 inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gold px-6 py-4 text-base font-semibold text-ink transition hover:bg-gold-soft">
        Continue on WhatsApp
      </a>
      <p className="mt-3 max-w-xs text-xs text-paper/45">
        Your seat is confirmed only after our team verifies teacher availability in your area.
      </p>
    </div>
  );
}

/* ============================ bits ============================ */
const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3.5 py-3 text-[15px] text-paper placeholder:text-paper/35 focus:border-gold/60 focus:outline-none";

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-paper/75">{label}</label>
      {children}
    </div>
  );
}

function Choice({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-medium text-paper/75">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button key={o} type="button" aria-pressed={value === o} onClick={() => onChange(o)}
            className={cn(
              "rounded-full border px-4 py-2.5 text-sm font-medium transition",
              value === o
                ? "border-gold bg-gold/15 text-gold-soft"
                : "border-white/12 bg-white/[0.03] text-paper/70 hover:border-white/25",
            )}>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-gold-soft" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l4 4 10-10" /></svg>
  );
}
