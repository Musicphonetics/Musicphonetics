"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { updatePassword } from "@/lib/supabase/auth";
import { Stave } from "@/components/ui/Stave";

const input =
  "w-full rounded-xl border border-white/15 bg-white/[0.06] px-4 py-3.5 text-base text-paper placeholder:text-paper/40 focus:border-gold focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

// Reached from a reset email (a recovery session lands here) or from a logged-in
// user changing their password. Works for teachers and parents alike.
export default function UpdatePassword() {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const { client } = getSupabaseSafe();
    if (!client) { setReady(true); return; }
    // The recovery token in the URL is exchanged for a session automatically.
    client.auth.getSession().then(({ data }) => { setHasSession(!!data.session); setReady(true); });
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => setHasSession(!!session));
    return () => sub.subscription.unsubscribe();
  }, []);

  async function save() {
    setMsg("");
    if (pw.length < 8) { setMsg("Use at least 8 characters."); return; }
    if (pw !== pw2) { setMsg("Passwords don't match."); return; }
    setBusy(true);
    const { error } = await updatePassword(pw);
    setBusy(false);
    if (error) setMsg(error);
    else setDone(true);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-ink px-5 py-10 text-paper">
      <div className="w-full max-w-sm">
        <div className="flex justify-center"><Stave className="w-16 opacity-80" /></div>
        <h1 className="mt-6 text-center font-display text-2xl font-semibold">Set a new password</h1>

        {!ready ? (
          <p className="mt-6 text-center text-sm text-paper/60">Loading…</p>
        ) : done ? (
          <div className="mt-7 rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-center">
            <p className="text-sm text-paper/80">Your password has been updated.</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/parent/login" className="rounded-full bg-gold py-3 text-sm font-semibold text-ink">Go to parent login</Link>
              <Link href="/teacher/login" className="rounded-full border border-white/25 py-3 text-sm font-semibold text-paper">Go to teacher login</Link>
            </div>
          </div>
        ) : !hasSession ? (
          <div className="mt-7 rounded-2xl border border-white/12 bg-white/[0.04] p-6 text-center">
            <p className="text-sm text-paper/75">
              This link is invalid or has expired. Please request a new reset link from your login page.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/parent/login" className="rounded-full bg-gold py-3 text-sm font-semibold text-ink">Parent login</Link>
              <Link href="/teacher/login" className="rounded-full border border-white/25 py-3 text-sm font-semibold text-paper">Teacher login</Link>
            </div>
          </div>
        ) : (
          <form className="mt-7 space-y-3 rounded-2xl border border-white/12 bg-white/[0.04] p-5"
            onSubmit={(e) => { e.preventDefault(); save(); }}>
            <input className={input} type="password" autoComplete="new-password" placeholder="New password"
              value={pw} onChange={(e) => setPw(e.target.value)} />
            <input className={input} type="password" autoComplete="new-password" placeholder="Confirm new password"
              value={pw2} onChange={(e) => setPw2(e.target.value)} />
            <button type="submit" disabled={busy}
              className="w-full rounded-full bg-gold py-3.5 text-base font-semibold text-ink disabled:opacity-60">
              {busy ? "Saving…" : "Update password"}
            </button>
            {msg && <p className="text-center text-sm text-paper/75">{msg}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
