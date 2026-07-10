"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Parent rates the class experience. Feeds testimonials + teacher quality later.
export function FeedbackCard({ studentId, studentName, dark }: { studentId: string; studentName: string; dark?: boolean }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [feature, setFeature] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit() {
    if (rating === 0) { setErr("Please pick a rating first."); return; }
    setErr(null); setBusy(true);
    const { data: { session } } = await getSupabase().auth.getSession();
    const { error } = await getSupabase().from("parent_feedback").insert({
      student_id: studentId,
      parent_id: session?.user?.id ?? null,
      rating,
      feedback: text.trim() || null,
      permission_to_feature: feature,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setDone(true);
  }

  if (done) {
    return (
      <div className={cn("rounded-2xl border p-5 text-center", dark ? "border-white/10 bg-onyx-1" : "border-hairline bg-white")}>
        <p className={cn("text-sm font-semibold", dark ? "text-paper" : "text-ink")}>Thank you 🙏</p>
        <p className={cn("mt-1 text-sm", dark ? "text-paper/65" : "text-ink/65")}>Your feedback helps us keep {studentName.split(" ")[0]}&apos;s learning on track.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-2xl border p-5", dark ? "border-white/10 bg-onyx-1" : "border-hairline bg-white")}>
      <p className={cn("mb-2 text-xs font-semibold uppercase tracking-wide", dark ? "text-paper/55" : "text-ink/55")}>How are the classes going?</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star`} onClick={() => setRating(n)}
            className={cn("text-2xl leading-none transition-transform hover:scale-110", n <= rating ? "text-gold" : dark ? "text-white/20" : "text-ink/20")}>★</button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
        placeholder="Anything you'd like to share (optional)"
        className={cn("mt-3 w-full rounded-xl border px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none",
          dark ? "border-white/15 bg-white/5 text-paper placeholder:text-paper/40" : "border-hairline bg-white")} />
      <label className={cn("mt-2 flex cursor-pointer items-start gap-2.5 text-xs", dark ? "text-paper/70" : "text-ink/70")}>
        <input type="checkbox" checked={feature} onChange={(e) => setFeature(e.target.checked)} className="mt-0.5 h-4 w-4 accent-gold" />
        Musicphonetics may feature this (anonymously) to help other families.
      </label>
      {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
      <button onClick={submit} disabled={busy}
        className={cn("mt-3 w-full rounded-full py-2.5 text-sm font-semibold disabled:opacity-50",
          dark ? "bg-gold text-ink" : "bg-ink text-paper")}>
        {busy ? "Sending…" : "Share feedback"}
      </button>
    </div>
  );
}
