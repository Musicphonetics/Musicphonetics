"use client";

import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

// Owner-editable "knowledge" the parent AI assistant answers from. This is how
// you steer the assistant: paste your real curriculum, FAQs, policies and it
// answers from that. Strict mode makes it refuse anything not covered. Stored in
// app_config (owner-only RLS); the AI endpoint reads it server-side.
export function AiKnowledge() {
  const [knowledge, setKnowledge] = useState("");
  const [strict, setStrict] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setLoaded(true); return; }
    getSupabase().from("app_config").select("key,value").in("key", ["ai_knowledge", "ai_strict"])
      .then(({ data, error }) => {
        if (error) {
          if (/relation|does not exist|schema cache/i.test(error.message)) setNeedsSetup(true);
        } else {
          for (const r of (data as { key: string; value: string }[]) ?? []) {
            if (r.key === "ai_knowledge") setKnowledge(r.value ?? "");
            if (r.key === "ai_strict") setStrict(r.value === "true");
          }
        }
        setLoaded(true);
      });
  }, []);

  async function save() {
    setBusy(true); setErr(null); setMsg(null);
    const rows = [
      { key: "ai_knowledge", value: knowledge.trim() },
      { key: "ai_strict", value: strict ? "true" : "false" },
    ];
    const { error } = await getSupabase().from("app_config").upsert(rows, { onConflict: "key" });
    setBusy(false);
    if (error) {
      if (/relation|does not exist|schema cache/i.test(error.message)) setNeedsSetup(true);
      else setErr(error.message);
    } else setMsg("Saved. The assistant now uses this knowledge.");
  }

  return (
    <section className="mt-6 rounded-2xl border border-hairline bg-white p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-lg font-semibold text-ink">AI assistant knowledge</p>
        <span className="rounded-full bg-gold/15 px-2.5 py-1 text-xs font-semibold text-[#7A5E0F]">Gemini</span>
      </div>
      <p className="mt-0.5 text-sm text-ink/60">
        This is what the parent &ldquo;Ask&rdquo; assistant answers from. Paste your real curriculum, FAQs, fees and
        policies here — the more complete, the better and safer the answers. It never fine-tunes the model; it grounds it.
      </p>

      {needsSetup ? (
        <p className="mt-3 rounded-lg bg-mist px-3 py-2 text-xs text-ink/70">Run <code className="rounded bg-white px-1">supabase/fixes_notifications_email.sql</code> first (it creates the <code>app_config</code> table).</p>
      ) : !loaded ? (
        <p className="mt-3 text-sm text-ink/50">Loading…</p>
      ) : (
        <>
          <textarea value={knowledge} onChange={(e) => { setKnowledge(e.target.value); setMsg(null); }} rows={12}
            placeholder={"Paste your curriculum, method, FAQs, fee rules, schedule policy, what each program covers, what a trial is like, etc.\n\nExample:\n- Foundation covers ... over 32 classes.\n- Fees are billed monthly; the first month is pro-rated.\n- Free trial: we match a teacher and schedule within 2 days."}
            className="mt-3 w-full rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink/40 focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
          <p className="mt-1 text-[11px] text-ink/45">{knowledge.length.toLocaleString()} characters {knowledge.length > 12000 && <span className="text-red-500">· only the first 12,000 are used</span>}</p>

          <label className="mt-3 flex cursor-pointer items-start gap-3 rounded-xl border border-hairline bg-paper/60 p-3">
            <input type="checkbox" checked={strict} onChange={(e) => { setStrict(e.target.checked); setMsg(null); }} className="mt-0.5 h-5 w-5 accent-gold" />
            <span className="text-sm text-ink/80">
              <b>Strict mode</b> — only answer what&apos;s in the knowledge above. If it&apos;s not covered, the assistant says it isn&apos;t sure and points to WhatsApp (recommended to stop random answers).
            </span>
          </label>

          {err && <p className="mt-2 text-xs text-red-600">{err}</p>}
          {msg && <p className="mt-2 text-xs font-semibold text-feature-green">{msg}</p>}
          <button onClick={save} disabled={busy}
            className={cn("mt-3 rounded-full px-6 py-2.5 text-sm font-semibold text-ink", busy ? "bg-gold/50" : "bg-gold hover:bg-deep-gold")}>
            {busy ? "Saving…" : "Save knowledge"}
          </button>
          <p className="mt-2 text-[11px] text-ink/45">Also requires <code className="rounded bg-mist px-1">GEMINI_API_KEY</code> set in Cloudflare. Leave this blank to use the built-in defaults.</p>
        </>
      )}
    </section>
  );
}
