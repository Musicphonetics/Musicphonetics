"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, sendPasswordReset } from "@/lib/supabase/auth";
import { getSupabaseSafe, isSupabaseConfigured } from "@/lib/supabase/client";
import { Logo } from "@/components/layout/Logo";
import { Loading } from "@/components/app/states";
import { Icon, Button, inputCls, BrandWave } from "@/components/app/ui";

// /app — the front door of the new application. Existing users sign in here with
// the SAME Supabase auth the classic portals use; on success they are routed to
// their /app workspace. No public sign-up is offered (owner decision): accounts
// are still provisioned by the owner / teacher application as before. The classic
// logins (/teacher/login, /parent/login, …) keep working unchanged.

// Portals that keep their own dedicated sign-in (not part of the /app shell yet).
const OTHER_PORTALS = [
  { label: "Owner / Admin", href: "/owner/login" },
  { label: "Sales", href: "/sales/login" },
  { label: "Trial", href: "/trial/login" },
];

export default function AppSignIn() {
  const { loading, configured, userId, profile } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [showOther, setShowOther] = useState(false);

  // Route a signed-in user to the right place. Teacher/parent land in the new
  // app; owner goes to the existing control centre (not rebuilt in /app yet).
  useEffect(() => {
    if (loading || !configured || !userId || !profile) return;
    if (profile.role === "teacher") router.replace("/app/teacher/home");
    else if (profile.role === "parent") router.replace("/app/parent/home");
    else if (profile.role === "owner") router.replace("/owner/dashboard");
  }, [loading, configured, userId, profile, router]);

  const routableRole = profile?.role === "teacher" || profile?.role === "parent" || profile?.role === "owner";
  const signedInRoutable = configured && !!userId && !!profile && routableRole;
  const signedInOther = configured && !!userId && !!profile && !routableRole;

  async function login() {
    setMsg(""); setBusy(true);
    const { client, error } = getSupabaseSafe();
    if (!client) { setBusy(false); setMsg(error || "App isn't available right now."); return; }
    try {
      const { error: authErr } = await client.auth.signInWithPassword({ email: email.trim(), password });
      setBusy(false);
      if (authErr) setMsg(authErr.message);
      // On success, useAuth picks up the session and the effect above routes.
    } catch (e) {
      setBusy(false);
      setMsg(e instanceof Error ? e.message : "Sign-in failed.");
    }
  }

  async function forgot() {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg("Enter your email above first, then tap reset."); return; }
    setMsg("Sending reset link…");
    const { error } = await sendPasswordReset(email);
    setMsg(error ? error : "If that email has an account, a reset link is on its way. Check your inbox.");
  }

  if (loading || signedInRoutable) {
    return <div className="grid min-h-[100svh] place-items-center bg-paper"><Loading /></div>;
  }

  if (signedInOther) {
    return (
      <div className="grid min-h-[100svh] place-items-center bg-paper px-5 text-center text-ink">
        <div className="max-w-sm">
          <div className="flex justify-center"><Logo /></div>
          <h1 className="mt-6 font-display text-xl font-semibold">Open your portal</h1>
          <p className="mt-2 text-[0.9rem] text-ink/60">Your account uses a dedicated portal rather than the new app.</p>
          <div className="mt-5 flex flex-col gap-2">
            {OTHER_PORTALS.map((o) => (
              <Link key={o.href} href={o.href} className="rounded-full border border-hairline bg-white py-2.5 text-sm font-semibold text-ink hover:border-gold/40">{o.label}</Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative grid min-h-[100svh] place-items-center overflow-hidden bg-paper px-5 py-10 text-ink">
      {/* soft brand ambience */}
      <div aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-gold/12 to-transparent blur-2xl" />
      <BrandWave className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full opacity-70" />

      <div className="relative w-full max-w-sm">
        <div className="flex justify-center"><Logo /></div>
        <div className="mt-6 text-center">
          <span className="rounded-full border border-gold/40 bg-gold/10 px-2.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-[0.14em] text-[#7A5E0F]">New app · preview</span>
          <h1 className="mt-4 font-display text-[1.7rem] font-semibold leading-tight">Sign in to Musicphonetics</h1>
          <p className="mt-1.5 text-[0.88rem] text-ink/55">Use the email and password for your account.</p>
        </div>

        {!isSupabaseConfigured() && (
          <p className="mt-6 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-center text-sm text-amber-800">
            Sign-in isn&apos;t configured in this environment.
          </p>
        )}

        <form className="mt-6 space-y-3 rounded-2xl border border-hairline bg-white p-5 shadow-card"
          onSubmit={(e) => { e.preventDefault(); login(); }}>
          <input className={inputCls} type="email" inputMode="email" autoComplete="email"
            placeholder="Email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className={inputCls} type="password" autoComplete="current-password"
            placeholder="Password" aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <Button type="submit" full size="lg" loading={busy}>
            {busy ? "Signing in…" : <>Sign in <Icon n="arrow" s={16} /></>}
          </Button>
          {msg && <p className="text-center text-sm text-ink/70" role="status">{msg}</p>}
          <button type="button" onClick={forgot} className="w-full text-center text-xs font-medium text-ink/55 hover:text-ink">
            Forgot password?
          </button>
        </form>

        <div className="mt-5 text-center">
          <button onClick={() => setShowOther((v) => !v)} className="text-[0.78rem] font-medium text-ink/50 hover:text-ink">
            Use a different portal {showOther ? "▲" : "▾"}
          </button>
          {showOther && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              {OTHER_PORTALS.map((o) => (
                <Link key={o.href} href={o.href} className="rounded-full border border-hairline bg-white px-3 py-1.5 text-[0.78rem] font-medium text-ink/70 hover:border-gold/40">{o.label}</Link>
              ))}
            </div>
          )}
        </div>

        <p className="mt-6 text-center text-[0.74rem] leading-relaxed text-ink/45">
          New here? Accounts are set up by Musicphonetics — your current portals keep working exactly as before.
        </p>
      </div>
    </div>
  );
}
