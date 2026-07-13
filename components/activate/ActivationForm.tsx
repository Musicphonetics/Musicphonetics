"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const INSTRUMENTS = ["Guitar", "Piano / Keyboard", "Vocals", "Drums", "Other"];

interface Creds { login_id: string; password: string }

export function ActivationForm() {
  const [student, setStudent] = useState("");
  const [parent, setParent] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [instrument, setInstrument] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creds, setCreds] = useState<Creds | null>(null);
  const [copied, setCopied] = useState(false);

  const ready = student.trim().length > 1 && phone.trim().length >= 8 && code.trim().length > 0;

  async function submit() {
    if (!ready || busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/activate-student", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: student.trim(), parent: parent.trim(), phone: phone.trim(), email: email.trim(), instrument, code: code.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setCreds({ login_id: data.login_id, password: data.password });
      } else {
        setError(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("We couldn't reach the server. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  function copy() {
    if (!creds) return;
    navigator.clipboard?.writeText(`Login ID: ${creds.login_id}\nPassword: ${creds.password}`).then(
      () => { setCopied(true); setTimeout(() => setCopied(false), 2000); },
      () => {}
    );
  }

  if (creds) {
    return (
      <div className="rounded-3xl border border-gold/40 bg-charcoal-2 p-7 sm:p-9">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/15 text-gold">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <h3 className="mt-4 font-display text-2xl font-semibold text-ivory">Your login is ready.</h3>
        <p className="mt-2 text-sm text-ivory/70">Save these now. Use them to sign in and see your progress.</p>

        <div className="mt-5 space-y-3 rounded-2xl border border-white/12 bg-charcoal p-5">
          <CredRow label="Login ID" value={creds.login_id} />
          <CredRow label="Password" value={creds.password} />
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button type="button" onClick={copy} className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full border border-white/20 px-5 text-sm font-semibold text-ivory transition hover:border-gold hover:text-gold">
            {copied ? "Copied" : "Copy details"}
          </button>
          <Link href="/parent/login" className="inline-flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-full bg-gold px-5 text-sm font-semibold text-charcoal transition hover:brightness-105">
            Sign in now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </Link>
        </div>
        <p className="mt-4 text-xs text-ivory/55">You can change your password any time from the login page.</p>
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
      <Field label="Email" hint="Used as your login id. Leave blank and we'll make one from your number.">
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
      <Field label="Access code" required hint="The code shared with your batch.">
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Enter your code" className={inputCls} />
      </Field>

      <button type="button" onClick={submit} disabled={!ready || busy}
        className={cn("mt-7 inline-flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full px-6 text-base font-semibold transition-all",
          ready && !busy ? "bg-gold text-charcoal shadow-[0_16px_40px_-14px_rgba(201,162,39,0.7)] hover:brightness-105" : "cursor-not-allowed bg-white/10 text-ivory/40")}>
        {busy ? "Activating…" : "Activate my account"}
        {!busy && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>

      {error && (
        <div role="alert" className="mt-3 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-center text-sm text-red-200">{error}</div>
      )}

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

function CredRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-xs uppercase tracking-wide text-ivory/50">{label}</span>
      <span className="break-all text-right font-mono text-sm font-semibold text-gold">{value}</span>
    </div>
  );
}
