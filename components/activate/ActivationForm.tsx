"use client";

import { useState } from "react";
import Link from "next/link";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

const INSTRUMENTS = ["Guitar", "Piano / Keyboard", "Vocals", "Drums", "Other"];

export function ActivationForm() {
  const [student, setStudent] = useState("");
  const [parent, setParent] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instrument, setInstrument] = useState("");
  const [done, setDone] = useState(false);

  const ready = student.trim().length > 1 && phone.trim().length >= 8;

  function submit() {
    if (!ready) return;
    const msg =
      `Student activation\n\n` +
      `Student: ${student.trim()}\n` +
      (parent.trim() ? `Parent: ${parent.trim()}\n` : "") +
      `WhatsApp: ${phone.trim()}\n` +
      (email.trim() ? `Email: ${email.trim()}\n` : "") +
      (instrument ? `Instrument: ${instrument}\n` : "") +
      `\nPlease set up my student portal login.`;
    window.open(whatsappLink(msg), "_blank", "noopener,noreferrer");
    setDone(true);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-gold/40 bg-charcoal-2 p-7 text-center sm:p-9">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold text-ivory">You are on the list.</h3>
        <p className="mx-auto mt-2 max-w-sm text-ivory/75">
          I will set up your login and send it to you on WhatsApp, usually the same day. Then you can sign in and see everything.
        </p>
        <Link href="/parent/login" className="mt-6 inline-flex min-h-[50px] items-center justify-center gap-2 rounded-full border border-gold/50 px-7 text-sm font-semibold text-gold transition hover:bg-gold hover:text-charcoal">
          Go to the login page
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/12 bg-charcoal-2 p-6 shadow-[0_30px_70px_-30px_rgba(0,0,0,0.6)] sm:p-8">
      <Field label="Student name" required>
        <input value={student} onChange={(e) => setStudent(e.target.value)} placeholder="Full name" className={inputCls} />
      </Field>
      <Field label="Parent name" hint="If the student is a child.">
        <input value={parent} onChange={(e) => setParent(e.target.value)} placeholder="Optional" className={inputCls} />
      </Field>
      <Field label="WhatsApp number" required>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" placeholder="10-digit number" className={inputCls} />
      </Field>
      <Field label="Email" hint="For your login, if you have one.">
        <input value={email} onChange={(e) => setEmail(e.target.value)} inputMode="email" placeholder="Optional" className={inputCls} />
      </Field>
      <Field label="Instrument">
        <div className="flex flex-wrap gap-2">
          {INSTRUMENTS.map((o) => (
            <button key={o} type="button" onClick={() => setInstrument(instrument === o ? "" : o)}
              className={cn("rounded-full border px-4 py-2 text-sm transition-colors",
                instrument === o ? "border-gold bg-gold/10 text-ivory" : "border-white/15 text-ivory/70 hover:border-white/30")}>
              {o}
            </button>
          ))}
        </div>
      </Field>

      <button type="button" onClick={submit} disabled={!ready}
        className={cn("mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all",
          ready ? "bg-gold text-charcoal shadow-[0_16px_40px_-14px_rgba(201,162,39,0.7)] hover:brightness-105" : "cursor-not-allowed bg-white/10 text-ivory/40")}>
        Activate my account
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>

      <p className="mt-4 text-center text-sm text-ivory/60">
        Already have your login?{" "}
        <Link href="/parent/login" className="font-semibold text-gold underline underline-offset-4">Sign in</Link>
      </p>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm text-ivory placeholder:text-ivory/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="mt-5 first:mt-0">
      <label className="text-sm font-semibold text-ivory">
        {label}
        {required ? <span className="ml-1 text-gold">*</span> : <span className="ml-2 text-[11px] font-normal text-ivory/60">optional</span>}
      </label>
      {hint && <p className="mb-2 mt-0.5 text-xs text-ivory/50">{hint}</p>}
      <div className={hint ? "" : "mt-2"}>{children}</div>
    </div>
  );
}
