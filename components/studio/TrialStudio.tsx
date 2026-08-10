"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { track } from "@/lib/track";

// ---------------------------------------------------------------------------
// Book a Trial — the front door to the Trial → Assessment → Conversion funnel.
// A short, warm wizard that provisions a REAL account and drops the family
// straight into their branded Trial Portal (the pre-assessment + journey live
// inside the portal, not here). No fabricated curriculum, no robot guesses.
// ---------------------------------------------------------------------------

const INSTRUMENTS = ["Guitar", "Piano", "Keyboard", "Vocals", "Ukulele", "Drums"];

export function TrialStudio() {
  const params = useSearchParams();
  const router = useRouter();

  const presetInst = (() => { const v = params.get("instrument"); return v && INSTRUMENTS.includes(v) ? v : ""; })();
  const [inst, setInst] = useState(presetInst || "Guitar");
  const [who, setWho] = useState("");
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const STEPS = (presetInst ? [] : ["instrument"]).concat(["who", "contact"]);
  const [qi, setQi] = useState(0);
  const stepKey = STEPS[qi];
  const pct = Math.round(((qi + 1) / STEPS.length) * 100);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [phase, setPhase] = useState<"form" | "opening">("form");

  const createAndEnter = useCallback(async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/trial/start", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({
          student_name: name, parent_name: who === "My child" ? name : "", who,
          student_age: who === "My child" ? age : "", email, phone, instrument: inst,
          utm_source: params.get("utm_source") || undefined,
          utm_medium: params.get("utm_medium") || undefined,
          utm_campaign: params.get("utm_campaign") || undefined,
        }),
      });
      const j = await r.json();
      if (!j.ok || !j.temp_password) { setErr(j.error || "Could not open your portal. Please try again."); setBusy(false); return; }
      track("generate_lead", { instrument: inst, source: "trial_portal" });
      setPhase("opening");
      // Auto sign-in with the just-issued credentials, then enter the portal.
      const { client } = getSupabaseSafe();
      if (client) {
        const { error } = await client.auth.signInWithPassword({ email, password: j.temp_password });
        if (!error) { router.replace("/trial/dashboard"); return; }
      }
      // Fallback: credentials are emailed; send them to the login page.
      router.replace("/trial/login?new=1");
    } catch {
      setErr("Could not reach the server. Please try again."); setBusy(false);
    }
  }, [name, who, age, email, phone, inst, params, router]);

  const next = useCallback(async () => {
    setErr("");
    if (stepKey === "instrument" && !inst) return setErr("Pick an instrument.");
    if (stepKey === "who" && (!who || !name.trim())) return setErr("Tell us who is learning, and a name.");
    if (stepKey === "contact") {
      if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email — it's your portal login.");
      if (phone.replace(/\D/g, "").length < 8) return setErr("Enter a valid phone / WhatsApp number.");
      return createAndEnter();
    }
    setQi((i) => Math.min(i + 1, STEPS.length - 1));
  }, [stepKey, inst, who, name, email, phone, createAndEnter, STEPS.length]);

  if (phase === "opening") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-white/15 border-t-gold" />
        <p className="mt-8 font-display text-2xl font-bold text-paper">Opening your Trial Portal…</p>
        <p className="mt-3 text-paper/60">Setting up {name || "your"} private space.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-5 py-8">
      <div className="flex items-center gap-2.5">
        <span className="grid h-9 w-9 place-items-center rounded-full border border-gold/50 bg-gold/10 font-display text-lg font-bold text-gold">♪</span>
        <div>
          <div className="font-display text-lg font-bold leading-none text-paper">Musicphonetics</div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gold/80">Book your trial</div>
        </div>
      </div>
      <div className="mt-6 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-gold transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>

      <div className="mt-10 flex-1">
        {stepKey === "instrument" && (
          <Q title="What would you like to learn?" sub="You can change this any time.">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {INSTRUMENTS.map((o) => <Choice key={o} active={inst === o} onClick={() => setInst(o)}>{o}</Choice>)}
            </div>
          </Q>
        )}
        {stepKey === "who" && (
          <Q title="Who is this trial for?" sub="So we personalise the whole experience.">
            <div className="grid grid-cols-2 gap-3">
              {["Myself", "My child"].map((o) => <Choice key={o} active={who === o} onClick={() => setWho(o)}>{o}</Choice>)}
            </div>
            <input className={inputCls} placeholder={who === "My child" ? "Child's name" : "Your name"} value={name} onChange={(e) => setName(e.target.value)} />
            {who === "My child" && (
              <div className="mt-3 grid grid-cols-4 gap-2">
                {["4-7", "8-12", "13-17", "18+"].map((a) => <Choice key={a} active={age === a} onClick={() => setAge(a)} small>{a}</Choice>)}
              </div>
            )}
          </Q>
        )}
        {stepKey === "contact" && (
          <Q title="Create your Trial Portal" sub="We instantly open a private portal and email your login. This is where your whole journey happens.">
            <input className={inputCls} inputMode="email" placeholder="Email (your portal login)" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className={inputCls + " mt-3"} inputMode="tel" placeholder="Phone / WhatsApp number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <p className="mt-3 text-xs text-paper/45">🔒 Private to you. We use this only for your trial and your portal login.</p>
          </Q>
        )}
      </div>

      {err && <p className="mt-2 text-sm text-red-300">{err}</p>}

      <div className="sticky bottom-0 mt-6 flex items-center gap-3 bg-ink/80 py-3 backdrop-blur">
        {qi > 0 && (
          <button onClick={() => { setErr(""); setQi((i) => Math.max(0, i - 1)); }}
            className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-paper/70 hover:text-paper">Back</button>
        )}
        <button onClick={next} disabled={busy}
          className="flex-1 rounded-full bg-gold px-6 py-3.5 text-base font-semibold text-ink transition hover:bg-[#f0d783] disabled:opacity-60">
          {busy ? "Opening…" : stepKey === "contact" ? "Open my Trial Portal →" : "Continue"}
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "mt-4 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3.5 text-paper placeholder-paper/40 outline-none focus:border-gold";

function Q({ title, sub, children }: { title: string; sub?: string; children: React.ReactNode }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold leading-tight text-paper sm:text-3xl">{title}</h1>
      {sub && <p className="mt-2 text-paper/60">{sub}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function Choice({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button type="button" onClick={onClick}
      className={
        "rounded-xl border font-semibold transition-all " +
        (small ? "px-2 py-2.5 text-center text-sm " : "px-4 py-3.5 text-left ") +
        (active ? "border-gold bg-gold/15 text-paper shadow-[0_0_0_1px_rgba(231,203,110,.5)]" : "border-white/15 bg-white/5 text-paper/80 hover:border-white/35")
      }>
      {children}
    </button>
  );
}
