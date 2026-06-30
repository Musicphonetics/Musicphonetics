"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import { InstrumentIcon } from "@/components/ui/InstrumentIcon";
import { whatsappLink } from "@/lib/data";
import {
  INSTRUMENTS, WHO, AGES, MODES, EXPERIENCE, GOALS, TIMINGS, BEGIN, AREAS,
  SOCIAL_PROOF, leadSummary, type LeadData,
} from "@/lib/onboarding";
import { cn } from "@/lib/utils";

type StepKey =
  | "intro" | "instrument" | "who" | "age" | "mode" | "location"
  | "experience" | "goal" | "timing" | "begin" | "contact" | "analyzing" | "success";

function buzz() {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
}

export function OnboardingFlow({ initialInstrument }: { initialInstrument?: string }) {
  // Entering with an instrument already chosen (from the homepage hero) skips
  // the intro + instrument steps and lands the user straight on "who".
  const [answers, setAnswers] = useState<LeadData>(
    initialInstrument ? { instrument: initialInstrument } : {}
  );
  const [idx, setIdx] = useState(initialInstrument ? 2 : 0);

  // Dynamic step list (age only for a child).
  const steps = useMemo<StepKey[]>(() => {
    const base: StepKey[] = ["intro", "instrument", "who"];
    if (answers.who === "My Child") base.push("age");
    return [...base, "mode", "location", "experience", "goal", "timing", "begin", "contact", "analyzing", "success"];
  }, [answers.who]);

  const step = steps[Math.min(idx, steps.length - 1)];
  const questionSteps = steps.filter((s) => !["intro", "analyzing", "success"].includes(s));
  const qIndex = questionSteps.indexOf(step);
  const progress =
    step === "intro" ? 0 :
    step === "analyzing" || step === "success" ? 100 :
    Math.round(((qIndex + 1) / questionSteps.length) * 100);

  const go = (n: number) => setIdx((i) => Math.max(0, Math.min(steps.length - 1, i + n)));
  const set = (k: keyof LeadData, v: string) => setAnswers((a) => ({ ...a, [k]: v }));
  const choose = (k: keyof LeadData, v: string) => {
    buzz();
    set(k, v);
    setTimeout(() => go(1), 200);
  };

  // Lead submission — awaited, with visible success/error states (never silent).
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  async function submitLead() {
    buzz();
    setSubmitting(true);
    setSubmitError(false);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...answers, source: "Website onboarding" }),
      });
      const data = (await res.json().catch(() => ({ ok: false }))) as { ok?: boolean };
      if (!res.ok || data.ok === false) throw new Error("delivery failed");
      setSubmitting(false);
      go(1); // proceed to the "analyzing" → success flow
    } catch {
      setSubmitting(false);
      setSubmitError(true);
    }
  }

  return (
    <div className="min-h-screen bg-ink text-paper lg:grid lg:grid-cols-[1fr_minmax(380px,440px)]">
      {/* Main — question column */}
      <main className="flex min-h-screen flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4 px-5 py-4 sm:px-8">
          {step !== "intro" && step !== "analyzing" && step !== "success" ? (
            <button type="button" onClick={() => go(-1)} className="inline-flex items-center gap-1.5 text-sm font-medium text-paper/60 hover:text-paper">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
              Back
            </button>
          ) : <Logo invert />}
          <span className="text-xs text-paper/45">
            {step === "intro" ? "~30 seconds" : step === "analyzing" || step === "success" ? "Almost done" : `Step ${qIndex + 1} of ${questionSteps.length}`}
          </span>
          <Link href="/" className="text-paper/40 hover:text-paper" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          </Link>
        </div>

        {/* Progress bar */}
        <div className="h-1 w-full bg-white/10">
          <div className="h-full bg-gold transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>

        {/* Step content */}
        <div key={step} className="animate-fade-up flex flex-1 flex-col justify-center px-5 py-8 sm:px-10">
          <div className="mx-auto w-full max-w-lg">
            {step === "intro" && (
              <Intro onStart={() => go(1)} />
            )}

            {step === "instrument" && (
              <Question title="Let's find your perfect music teacher." sub="Which instrument would you like to learn?">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {INSTRUMENTS.map((o) => (
                    <CardOption key={o.value} selected={answers.instrument === o.value} onClick={() => choose("instrument", o.value)}>
                      <span className="text-gold"><InstrumentIcon name={o.icon} size={28} /></span>
                      <span className="mt-2 text-sm font-semibold">{o.label}</span>
                    </CardOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "who" && (
              <Question title="Who are the classes for?">
                <div className="grid grid-cols-2 gap-3">
                  {WHO.map((o) => (
                    <PillOption key={o.value} selected={answers.who === o.value} onClick={() => choose("who", o.value)}>{o.label}</PillOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "age" && (
              <Question title="How old is the learner?">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {AGES.map((o) => (
                    <PillOption key={o.value} selected={answers.childAge === o.value} onClick={() => choose("childAge", o.value)}>{o.label}</PillOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "mode" && (
              <Question title="How would you like to learn?">
                <div className="grid gap-3 sm:grid-cols-3">
                  {MODES.map((o) => (
                    <CardOption key={o.value} selected={answers.mode === o.value} onClick={() => choose("mode", o.value)}>
                      <span className="text-base font-semibold">{o.label}</span>
                      <span className="mt-1 text-xs text-paper/55">{o.hint}</span>
                    </CardOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "location" && (
              <TextStep
                title="Where are you located?"
                placeholder="Start typing your area…"
                list={AREAS}
                value={answers.location ?? ""}
                onChange={(v) => set("location", v)}
                onContinue={() => go(1)}
                valid={(answers.location ?? "").trim().length > 1}
              />
            )}

            {step === "experience" && (
              <Question title="What's your current level?">
                <div className="grid gap-3 sm:grid-cols-2">
                  {EXPERIENCE.map((o) => (
                    <PillOption key={o.value} selected={answers.experience === o.value} onClick={() => choose("experience", o.value)}>{o.label}</PillOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "goal" && (
              <Question title="What's the goal?">
                <div className="grid gap-3 sm:grid-cols-2">
                  {GOALS.map((o) => (
                    <PillOption key={o.value} selected={answers.goal === o.value} onClick={() => choose("goal", o.value)}>{o.label}</PillOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "timing" && (
              <Question title="Preferred timing?">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {TIMINGS.map((o) => (
                    <PillOption key={o.value} selected={answers.timing === o.value} onClick={() => choose("timing", o.value)}>{o.label}</PillOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "begin" && (
              <Question title="When would you like to begin?">
                <div className="grid grid-cols-2 gap-3">
                  {BEGIN.map((o) => (
                    <PillOption key={o.value} selected={answers.begin === o.value} onClick={() => choose("begin", o.value)}>{o.label}</PillOption>
                  ))}
                </div>
              </Question>
            )}

            {step === "contact" && (
              <ContactStep
                data={answers}
                set={set}
                onSubmit={submitLead}
                submitting={submitting}
                error={submitError}
              />
            )}

            {step === "analyzing" && (
              <Analyzing answers={answers} onDone={() => go(1)} />
            )}

            {step === "success" && <Success answers={answers} />}
          </div>
        </div>
      </main>

      {/* Aside — desktop trust panel */}
      <aside className="relative hidden flex-col justify-between overflow-hidden bg-midnight p-10 lg:flex">
        <div aria-hidden="true" className="pointer-events-none absolute -right-20 top-0 h-80 w-80 rounded-full bg-deep-gold/15 blur-3xl" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Find your teacher</p>
          <p className="mt-3 font-display text-2xl font-semibold leading-snug text-paper">
            India&apos;s most premium one-to-one music academy.
          </p>
        </div>
        <SocialProof />
        <div className="relative grid grid-cols-2 gap-4">
          {[
            { v: "1,100+", l: "Students" },
            { v: "4.9★", l: "Parent rating" },
            { v: "10+ yrs", l: "Teaching" },
            { v: "126", l: "Active teachers" },
          ].map((s) => (
            <div key={s.l} className="mp-glass rounded-2xl p-4">
              <p className="font-display text-xl font-semibold text-paper">{s.v}</p>
              <p className="text-xs text-paper/55">{s.l}</p>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile social proof ticker */}
      <div className="border-t border-white/10 px-5 py-3 lg:hidden">
        <SocialProof compact />
      </div>
    </div>
  );
}

/* ---------- pieces ---------- */

function Intro({ onStart }: { onStart: () => void }) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">Musicphonetics</p>
      <h1 className="mt-5 font-display text-3xl font-semibold leading-tight sm:text-5xl">
        Let&apos;s find your perfect music teacher.
      </h1>
      <p className="mt-4 text-paper/65">A few quick questions — start in 30 seconds.</p>
      <button type="button" onClick={onStart} className="mt-8 min-h-[56px] w-full rounded-full bg-gold px-8 text-base font-semibold text-ink transition-transform active:scale-95 sm:w-auto sm:px-12">
        Begin
      </button>
    </div>
  );
}

function Question({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
      {sub && <p className="mt-2 text-paper/60">{sub}</p>}
      <div className="mt-7">{children}</div>
    </div>
  );
}

function CardOption({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mp-glass flex min-h-[88px] flex-col items-center justify-center rounded-2xl p-4 text-center transition-all duration-200 active:scale-95",
        selected ? "border-gold/60 ring-2 ring-gold/50" : "hover:border-gold/40"
      )}
    >
      {children}
    </button>
  );
}

function PillOption({ selected, onClick, children }: { selected?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "mp-glass flex min-h-[60px] items-center justify-center rounded-2xl px-5 text-center text-sm font-semibold transition-all duration-200 active:scale-95",
        selected ? "border-gold/60 ring-2 ring-gold/50 text-gold" : "text-paper/90 hover:border-gold/40"
      )}
    >
      {children}
    </button>
  );
}

function TextStep({ title, placeholder, list, value, onChange, onContinue, valid }: {
  title: string; placeholder: string; list?: string[]; value: string;
  onChange: (v: string) => void; onContinue: () => void; valid: boolean;
}) {
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">{title}</h2>
      <input
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        list={list ? "area-list" : undefined}
        className="mt-7 min-h-[56px] w-full rounded-2xl border border-white/15 bg-white/5 px-5 text-base text-paper placeholder:text-paper/40 focus:border-gold/50 focus:outline-none"
      />
      {list && (
        <datalist id="area-list">
          {list.map((a) => <option key={a} value={a} />)}
        </datalist>
      )}
      <ContinueBtn onClick={onContinue} disabled={!valid} />
    </div>
  );
}

function ContactStep({ data, set, onSubmit, submitting, error }: {
  data: LeadData;
  set: (k: keyof LeadData, v: string) => void;
  onSubmit: () => void;
  submitting: boolean;
  error: boolean;
}) {
  const phoneOk = /\d{10}/.test((data.phone ?? "").replace(/\D/g, ""));
  const nameOk = (data.name ?? "").trim().length > 1;
  const field = "min-h-[56px] w-full rounded-2xl border border-white/15 bg-white/5 px-5 text-base text-paper placeholder:text-paper/40 focus:border-gold/50 focus:outline-none";
  return (
    <div>
      <h2 className="font-display text-2xl font-semibold leading-tight sm:text-3xl">Almost there — where do we reach you?</h2>
      <p className="mt-2 text-paper/60">We&apos;ll match you with a teacher and call back within 15 minutes.</p>
      <div className="mt-7 space-y-3">
        <input autoFocus value={data.name ?? ""} onChange={(e) => set("name", e.target.value)} placeholder="Full name" className={field} />
        <input value={data.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="Phone / WhatsApp" inputMode="tel" className={field} />
        <input value={data.email ?? ""} onChange={(e) => set("email", e.target.value)} placeholder="Email (optional)" inputMode="email" className={field} />
      </div>
      <ContinueBtn
        onClick={onSubmit}
        disabled={!(nameOk && phoneOk) || submitting}
        label={submitting ? "Sending…" : "Find my teacher"}
      />
      {error && (
        <div className="mt-4 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200">
          <p className="font-semibold">We couldn&apos;t send that just now.</p>
          <p className="mt-1 text-red-200/80">
            Please try again — or reach us directly on{" "}
            <a
              href={whatsappLink(leadSummary(data))}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gold underline underline-offset-2"
            >
              WhatsApp
            </a>
            .
          </p>
        </div>
      )}
    </div>
  );
}

function ContinueBtn({ onClick, disabled, label = "Continue" }: { onClick: () => void; disabled?: boolean; label?: string }) {
  return (
    <button
      type="button"
      onClick={() => { buzz(); onClick(); }}
      disabled={disabled}
      className="mt-7 min-h-[56px] w-full rounded-full bg-gold text-base font-semibold text-ink transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {label}
    </button>
  );
}

const ANALYZE_ITEMS = ["Location", "Instrument", "Learning Goal", "Schedule", "Experience"];

function Analyzing({ onDone }: { answers: LeadData; onDone: () => void }) {
  const [checked, setChecked] = useState(0);

  // The lead is already submitted (awaited) on the contact step; this is the
  // post-submit "finding your teacher" flourish only — no network here.
  useEffect(() => {
    const timers = ANALYZE_ITEMS.map((_, i) => setTimeout(() => setChecked(i + 1), 500 + i * 450));
    const done = setTimeout(onDone, 500 + ANALYZE_ITEMS.length * 450 + 900);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center">
      <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
      <h2 className="mt-6 font-display text-2xl font-semibold">Finding your perfect teacher…</h2>
      <ul className="mx-auto mt-6 max-w-xs space-y-2 text-left">
        {ANALYZE_ITEMS.map((it, i) => (
          <li key={it} className={cn("flex items-center gap-3 transition-opacity", i < checked ? "opacity-100" : "opacity-30")}>
            <span className={cn("grid h-5 w-5 place-items-center rounded-full", i < checked ? "bg-gold text-ink" : "bg-white/10")}>
              {i < checked && <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </span>
            <span className="text-sm text-paper/80">{it}</span>
          </li>
        ))}
      </ul>
      {checked >= ANALYZE_ITEMS.length && (
        <div className="mp-glass mx-auto mt-8 max-w-xs animate-fade-up rounded-2xl p-5">
          <p className="text-xs uppercase tracking-wide text-gold">Best match found</p>
          <p className="mt-2 font-display text-4xl font-semibold text-paper">98%</p>
          <p className="text-sm text-paper/60">Teacher compatibility</p>
          <p className="mt-3 text-xs text-paper/50">Recommended trial within 24 hours · avg response 1 minute</p>
        </div>
      )}
    </div>
  );
}

function Success({ answers }: { answers: LeadData }) {
  return (
    <div className="text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold text-ink">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <h2 className="mt-6 font-display text-3xl font-semibold">Enquiry received{answers.name ? `, ${answers.name.split(" ")[0]}` : ""}.</h2>
      <p className="mt-3 text-paper/70">
        Thank you — your details are with our team. A Musicphonetics advisor will
        contact you shortly to confirm your trial and match you with the right
        teacher.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link href="/teachers" className="min-h-[56px] rounded-full bg-gold text-base font-semibold leading-[56px] text-ink transition-transform active:scale-95">
          Meet Our Teachers
        </Link>
        <Link href="/" className="min-h-[56px] rounded-full border border-white/25 text-base font-semibold leading-[56px] text-paper transition-colors hover:bg-white/5">
          Continue Browsing
        </Link>
        <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="mt-1 text-sm font-medium text-paper/55 hover:text-paper">
          Prefer to chat now? Message us on WhatsApp →
        </a>
      </div>
    </div>
  );
}

function SocialProof({ compact }: { compact?: boolean }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((p) => (p + 1) % SOCIAL_PROOF.length), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <div className={cn("relative", compact ? "" : "mp-glass rounded-2xl p-4")}>
      <div className="flex items-center gap-2.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
        </span>
        <span key={i} className="animate-fade-up text-sm text-paper/75">{SOCIAL_PROOF[i]}</span>
      </div>
    </div>
  );
}
