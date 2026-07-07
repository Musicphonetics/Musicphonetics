"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { Stave } from "@/components/ui/Stave";
import { cn } from "@/lib/utils";

const input =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-base text-paper placeholder:text-paper/40 focus:border-gold focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

export default function TeacherLogin() {
  const router = useRouter();
  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  // Already signed in → go to dashboard.
  useEffect(() => {
    if (!isSupabaseConfigured()) return;
    getSupabase().auth.getSession().then(({ data }) => {
      if (data.session) router.replace("/teacher/dashboard");
    });
  }, [router]);

  const e164 = (p: string) => (p.startsWith("+") ? p : "+91" + p.replace(/\D/g, ""));

  async function sendOtp() {
    setMsg(""); setBusy(true);
    const { error } = await getSupabase().auth.signInWithOtp({ phone: e164(phone) });
    setBusy(false);
    if (error) setMsg(error.message);
    else { setSent(true); setMsg("Code sent. Check your SMS."); }
  }
  async function verifyOtp() {
    setMsg(""); setBusy(true);
    const { error } = await getSupabase().auth.verifyOtp({ phone: e164(phone), token: otp, type: "sms" });
    setBusy(false);
    if (error) setMsg(error.message);
    else router.replace("/teacher/dashboard");
  }
  async function emailLogin() {
    setMsg(""); setBusy(true);
    const { error } = await getSupabase().auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setMsg(error.message);
    else router.replace("/teacher/dashboard");
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-10 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex justify-center"><Stave className="w-16 opacity-80" /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-semibold">Teacher OS</h1>
        <p className="mt-1.5 text-center text-sm text-paper/60">Sign in to your Musicphonetics portal.</p>

        {!isSupabaseConfigured() && (
          <p className="mt-6 rounded-xl border border-red-400/40 bg-red-500/10 p-3 text-center text-sm text-red-200">
            Portal not configured yet. Supabase keys are missing.
          </p>
        )}

        <div className="mt-7 rounded-2xl border border-white/12 bg-white/[0.04] p-5">
          {/* mode toggle */}
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-full bg-white/[0.06] p-1 text-sm">
            {(["phone", "email"] as const).map((m) => (
              <button key={m} onClick={() => { setMode(m); setMsg(""); }}
                className={cn("rounded-full py-2 font-semibold capitalize transition-colors",
                  mode === m ? "bg-gold text-ink" : "text-paper/70")}>
                {m === "phone" ? "Phone OTP" : "Email"}
              </button>
            ))}
          </div>

          {mode === "phone" ? (
            <div className="space-y-3">
              <input className={input} inputMode="tel" placeholder="Phone (10-digit)"
                value={phone} onChange={(e) => setPhone(e.target.value)} disabled={sent} />
              {sent && (
                <input className={input} inputMode="numeric" placeholder="6-digit code"
                  value={otp} onChange={(e) => setOtp(e.target.value)} />
              )}
              <button disabled={busy} onClick={sent ? verifyOtp : sendOtp}
                className="w-full rounded-full bg-gold py-3.5 text-base font-semibold text-ink disabled:opacity-60">
                {busy ? "Please wait…" : sent ? "Verify & sign in" : "Send code"}
              </button>
              {sent && <button onClick={() => { setSent(false); setOtp(""); }} className="w-full text-center text-xs text-paper/55">Use a different number</button>}
            </div>
          ) : (
            <div className="space-y-3">
              <input className={input} inputMode="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className={input} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button disabled={busy} onClick={emailLogin}
                className="w-full rounded-full bg-gold py-3.5 text-base font-semibold text-ink disabled:opacity-60">
                {busy ? "Please wait…" : "Sign in"}
              </button>
            </div>
          )}

          {msg && <p className="mt-4 text-center text-sm text-paper/75">{msg}</p>}
        </div>

        <p className="mt-6 text-center text-xs text-paper/45">
          Accounts are created by Musicphonetics. No public sign-up.
        </p>
      </div>
    </div>
  );
}
