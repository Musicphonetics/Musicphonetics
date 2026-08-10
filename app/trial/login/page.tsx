"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseSafe, isSupabaseConfigured } from "@/lib/supabase/client";
import { sendPasswordReset } from "@/lib/supabase/auth";
import { Stave } from "@/components/ui/Stave";

const input =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-base text-paper placeholder:text-paper/40 focus:border-gold focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

export default function TrialLogin() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <TrialLoginInner />
    </Suspense>
  );
}

function TrialLoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  const isNew = params.get("new") === "1";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const { client, error } = getSupabaseSafe();
    if (!client) { if (error) setMsg(error); return; }
    client.auth.getSession()
      .then(({ data }) => { if (data.session) router.replace("/trial/dashboard"); })
      .catch(() => {});
  }, [router]);

  async function login() {
    setMsg(""); setBusy(true);
    const { client, error } = getSupabaseSafe();
    if (!client) { setBusy(false); setMsg(error || "Portal not configured"); return; }
    try {
      const { error: authErr } = await client.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (authErr) setMsg(authErr.message);
      else router.replace("/trial/dashboard");
    } catch (e) {
      setBusy(false); setMsg(e instanceof Error ? e.message : "Sign-in failed");
    }
  }

  async function forgot() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg("Enter your email above first, then tap reset."); return; }
    setMsg("Sending reset link…");
    const { error } = await sendPasswordReset(email);
    setMsg(error ? error : "If that email has an account, a reset link is on its way. Check your inbox.");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-10 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex justify-center"><Stave className="w-16 opacity-80" /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-semibold">Trial Portal</h1>
        <p className="mt-1.5 text-center text-sm text-paper/60">Your Musicphonetics trial journey.</p>

        {isNew && (
          <p className="mt-6 rounded-xl border border-gold/40 bg-gold/10 p-3 text-center text-sm text-paper/85">
            Your portal is ready. We emailed your login — enter it below to continue.
          </p>
        )}
        {!isSupabaseConfigured() && (
          <p className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
            Portal not configured yet.
          </p>
        )}

        <form className="mt-7 space-y-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5"
          onSubmit={(e) => { e.preventDefault(); login(); }}>
          <input className={input} type="email" inputMode="email" autoComplete="email"
            placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={input} type="password" autoComplete="current-password"
            placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" disabled={busy}
            className="w-full rounded-full bg-gold py-3.5 text-base font-semibold text-ink disabled:opacity-60">
            {busy ? "Signing in…" : "Enter my portal"}
          </button>
          {msg && <p className="text-center text-sm text-paper/75">{msg}</p>}
          <button type="button" onClick={forgot} className="w-full text-center text-xs font-medium text-gold/90 hover:text-gold">
            Forgot password?
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-paper/45">
          Haven&rsquo;t booked yet? <a href="/studio" className="text-gold/90 hover:text-gold">Book your free trial →</a>
        </p>
      </div>
    </div>
  );
}
