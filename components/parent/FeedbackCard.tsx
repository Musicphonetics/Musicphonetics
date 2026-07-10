"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Parent rates the class experience. Feeds testimonials + teacher quality later.
export function FeedbackCard({ studentId, studentName }: { studentId: string; studentName: string }) {
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
      <div className="rounded-2xl border border-hairline bg-white p-5 text-center">
        <p className="text-sm font-semibold text-ink">Thank you 🙏</p>
        <p className="mt-1 text-sm text-ink/65">Your feedback helps us keep {studentName.split(" ")[0]}&apos;s learning on track.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-hairline bg-white p-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">How are the classes going?</p>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" aria-label={`${n} star`} onClick={() => setRating(n)}
            className={cn("text-2xl leading-none transition-transform hover:scale-110", n <= rating ? "text-gold" : "text-ink/20")}>★</button>
        ))}
      </div>
      <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2}
        placeholder="Anything you'd like to share (optional)"
        className="mt-3 w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
      <label className="mt-2 flex cursor-pointer items-start gap-2.5 text-xs text-ink/70">
        <input type="checkbox" checked={feature} onChange={(e) => setFeature(e.target.checked)} className="mt-0.5 h-4 w-4 accent-gold" />
        Musicphonetics may feature this (anonymously) to help other families.
      </label>
      {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
      <button onClick={submit} disabled={busy}
        className="mt-3 w-full rounded-full bg-ink py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
        {busy ? "Sending…" : "Share feedback"}
      </button>
    </div>
  );
}
