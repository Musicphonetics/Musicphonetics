"use client";

import { useEffect, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading } from "@/components/portal/kit";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import {
  loadDirectorMessages, saveDirectorMessage, setDirectorMessagePublished, deleteDirectorMessage,
  type DirectorMessage, type DirectorAudience,
} from "@/lib/supabase/director";
import { cn } from "@/lib/utils";

const AUDIENCES: { key: DirectorAudience; label: string; hint: string }[] = [
  { key: "parents", label: "Parents & students", hint: "Shows in the parent portal" },
  { key: "teachers", label: "Teachers", hint: "Shows in the teacher portal" },
  { key: "all", label: "Everyone", hint: "Shows in both portals" },
];
const pretty = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function OwnerMessages() {
  const [rows, setRows] = useState<DirectorMessage[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [audience, setAudience] = useState<DirectorAudience>("parents");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  async function refresh() {
    const { rows, error } = await loadDirectorMessages();
    setRows(rows); setErr(error);
  }
  useEffect(() => { if (isSupabaseConfigured()) refresh(); }, []);

  async function publish() {
    if (!body.trim()) { setNote("Write a message first."); return; }
    setBusy(true); setNote(null);
    const { error } = await saveDirectorMessage({ audience, title, body });
    setBusy(false);
    if (error) { setNote(error.message); return; }
    setTitle(""); setBody(""); setNote("Message published ✓");
    refresh();
  }
  async function toggle(m: DirectorMessage) {
    await setDirectorMessagePublished(m.id, !m.is_published); refresh();
  }
  async function remove(id: string) {
    await deleteDirectorMessage(id); refresh();
  }

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Director's messages">
      <p className="-mt-2 mb-5 max-w-2xl text-sm text-ink/60">
        Write a personal message to your students &amp; parents, or to your teachers. It appears at
        the top of their portal in place of the default note. Publish as many as you like - the most
        recent published one shows.
      </p>

      {/* Composer */}
      <div className="rounded-2xl border border-hairline bg-white p-5 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/55">Who is this for?</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {AUDIENCES.map((a) => (
            <button key={a.key} type="button" onClick={() => setAudience(a.key)}
              className={cn("rounded-xl border p-3 text-left transition-colors",
                audience === a.key ? "border-gold bg-gold/10" : "border-hairline hover:border-ink/30")}>
              <span className="block text-sm font-semibold text-ink">{a.label}</span>
              <span className="block text-xs text-ink/55">{a.hint}</span>
            </button>
          ))}
        </div>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Title <span className="font-normal text-ink/45">(optional)</span></span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80}
            placeholder="e.g. Happy Monsoon! · Fees reminder · Well done this month"
            className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        </label>

        <label className="mt-3 block">
          <span className="mb-1.5 block text-sm font-semibold text-ink">Your message</span>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5}
            placeholder="Write from the heart. Press Enter for a new paragraph."
            className="w-full rounded-xl border border-hairline bg-white px-4 py-3 text-base text-ink placeholder:text-ink/40 focus:border-ink focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        </label>

        <div className="mt-4 flex items-center gap-3">
          <button onClick={publish} disabled={busy}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper disabled:opacity-60">
            {busy ? "Publishing…" : "Publish message"}
          </button>
          {note && <span className="text-sm text-ink/70">{note}</span>}
        </div>
      </div>

      {/* Existing */}
      <div className="mt-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink/55">Your messages</p>
        {err && <div className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err} — did you run the director_messages.sql migration?</div>}
        {!rows ? <Loading /> : rows.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-hairline bg-paper p-6 text-sm text-ink/55">No messages yet. Your first one will appear here.</p>
        ) : (
          <div className="space-y-3">
            {rows.map((m) => (
              <div key={m.id} className="rounded-2xl border border-hairline bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
                    m.audience === "teachers" ? "bg-gold/15 text-[#7A5E0F]" : m.audience === "all" ? "bg-feature-green/15 text-feature-green" : "bg-ink/10 text-ink/70")}>
                    {m.audience === "all" ? "Everyone" : m.audience === "teachers" ? "Teachers" : "Parents"}
                  </span>
                  <span className="text-xs text-ink/50">{pretty(m.created_at)}</span>
                  {!m.is_published && <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[11px] font-medium text-ink/50">Hidden</span>}
                </div>
                {m.title && <p className="mt-2 font-display text-base font-semibold text-ink">{m.title}</p>}
                <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink/75">{m.body}</p>
                <div className="mt-3 flex gap-4 text-sm font-semibold">
                  <button onClick={() => toggle(m)} className="text-[#7A5E0F] hover:underline">{m.is_published ? "Hide" : "Publish"}</button>
                  <button onClick={() => remove(m.id)} className="text-red-600 hover:underline">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PortalShell>
  );
}
