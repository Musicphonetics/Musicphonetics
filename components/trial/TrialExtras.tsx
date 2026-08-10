"use client";

import { useEffect, useState } from "react";
import { getSupabaseSafe } from "@/lib/supabase/client";
import { Loading } from "@/components/portal/kit";
import { useTrial } from "./shared";

const inp = "w-full rounded-xl border border-hairline bg-white px-4 py-3 text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none";

// -------------------- Ask --------------------
export function TrialAsk() {
  const { session: s, loading, reload } = useTrial();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  if (loading) return <Loading />;

  const send = async () => {
    if (!text.trim()) return;
    setBusy(true);
    const { client } = getSupabaseSafe();
    if (client) await client.rpc("mp_trial_feedback", { p_text: text });
    setBusy(false); setSent(true); setText(""); reload();
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-hairline bg-white p-6 shadow-card">
        <h1 className="font-display text-xl font-bold text-ink">A question or concern?</h1>
        <p className="mt-1 text-sm text-ink/60">Ask us anything before you begin — a worry, a request, or a question about how classes work. We read every message.</p>
        {sent ? (
          <p className="mt-4 rounded-xl bg-gold/10 p-3 text-sm font-semibold text-[#7A5E0F]">Got it — we&rsquo;ll bring this up personally. 🙌</p>
        ) : (
          <>
            <textarea className={inp + " mt-4"} rows={4} value={text} onChange={(e) => setText(e.target.value)}
              placeholder="e.g. My child is shy, or I only have weekends free, or can we speak to the Director?" />
            <button onClick={send} disabled={busy || !text.trim()} className="mt-3 w-full rounded-full bg-ink py-3.5 text-base font-semibold text-paper disabled:opacity-50">
              {busy ? "Sending…" : "Send to my mentor"}
            </button>
          </>
        )}
      </div>

      {s?.feedback && s.feedback.length > 0 && (
        <div className="rounded-3xl border border-hairline bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-widest text-[#7A5E0F]">Your messages</p>
          <ul className="mt-3 space-y-2">
            {s.feedback.slice().reverse().map((f, i) => (
              <li key={i} className="rounded-xl bg-paper p-3 text-sm text-ink/75">{f.text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// -------------------- Updates --------------------
export function TrialUpdates() {
  const { session: s, loading } = useTrial();
  if (loading) return <Loading />;
  const items: { icon: string; t: string; d: string }[] = [];
  if (s?.director_review || s?.recommendation) items.push({ icon: "⭐", t: "Your recommendation is ready", d: "The Director has reviewed your assessment. See your pathway in Journey." });
  if (s?.director_note) items.push({ icon: "✍️", t: "A note from the Director", d: s.director_note });
  if (s?.teacher_summary) items.push({ icon: "🎓", t: "Your teacher's summary", d: s.teacher_summary });
  items.push({ icon: "✅", t: "Trial booked", d: "Welcome to Musicphonetics. Your journey has begun." });

  return (
    <div className="space-y-3">
      <h1 className="px-1 font-display text-xl font-bold text-ink">Updates</h1>
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3 rounded-2xl border border-hairline bg-white p-4 shadow-card">
          <span className="text-xl">{it.icon}</span>
          <div><div className="font-bold text-ink">{it.t}</div><div className="text-sm text-ink/60">{it.d}</div></div>
        </div>
      ))}
    </div>
  );
}

// -------------------- Profile --------------------
export function TrialProfile() {
  const { session: s, loading } = useTrial();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const { client } = getSupabaseSafe();
    client?.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
  }, []);

  if (loading) return <Loading />;

  const changePw = async () => {
    if (pw.length < 6) { setMsg("Password must be at least 6 characters."); return; }
    setBusy(true); setMsg("");
    const { client } = getSupabaseSafe();
    const { error } = client ? await client.auth.updateUser({ password: pw }) : { error: { message: "Not configured" } };
    setBusy(false); setPw("");
    setMsg(error ? error.message : "Password updated. ✓");
  };
  const signOut = async () => { const { client } = getSupabaseSafe(); await client?.auth.signOut(); window.location.href = "/trial/login"; };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-hairline bg-white p-6 shadow-card">
        <h1 className="font-display text-xl font-bold text-ink">Your account</h1>
        <div className="mt-4 space-y-1 text-sm">
          <Row k="Name" v={s?.student_name || "—"} />
          <Row k="Email" v={email || "—"} />
          <Row k="Instrument" v={s?.instrument || "—"} />
        </div>
      </div>
      <div className="rounded-3xl border border-hairline bg-white p-6 shadow-card">
        <h2 className="font-display text-lg font-bold text-ink">Set your password</h2>
        <p className="mt-1 text-sm text-ink/55">Replace the temporary password we emailed you.</p>
        <input className={inp + " mt-3"} type="password" placeholder="New password" value={pw} onChange={(e) => setPw(e.target.value)} />
        <button onClick={changePw} disabled={busy} className="mt-3 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper disabled:opacity-50">
          {busy ? "Saving…" : "Update password"}
        </button>
        {msg && <p className="mt-2 text-sm text-ink/70">{msg}</p>}
      </div>
      <button onClick={signOut} className="w-full rounded-full border border-hairline bg-white py-3.5 text-sm font-semibold text-ink/70 shadow-card">Sign out</button>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-4 border-b border-hairline py-2 last:border-0"><span className="text-ink/55">{k}</span><span className="font-semibold text-ink">{v}</span></div>;
}
