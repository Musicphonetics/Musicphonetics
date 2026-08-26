"use client";

import { useRef, useState } from "react";
import { aiAsk } from "@/lib/ai";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Msg { role: "user" | "ai"; text: string }

const STARTERS = [
  "How does the Foundation journey work?",
  "What happens in a free trial class?",
  "How are the monthly fees billed?",
  "What will my child learn in the first month?",
];

// Free, instant curriculum Q&A for parents, answered by AI grounded in the
// Musicphonetics method (server-side; no key in the browser).
export function AskAI({ studentName, instrument }: { studentName?: string; instrument?: string | null }) {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  async function ask(q: string) {
    const question = q.trim();
    if (!question || busy) return;
    setErr(null);
    setInput("");
    setMsgs((m) => [...m, { role: "user", text: question }]);
    setBusy(true);
    try {
      const answer = await aiAsk(question, { student_name: studentName, instrument });
      setMsgs((m) => [...m, { role: "ai", text: answer }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't get an answer. Please try again.");
    }
    setBusy(false);
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="rounded-2xl border border-hairline bg-white p-5">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gold/15 text-[#7A5E0F]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3l1.6 3.9L18 8l-3.4 2.4L15 15l-3-2.3L9 15l.4-4.6L6 8l4.4-1.1L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
          </span>
          <div>
            <h1 className="font-display text-lg font-semibold text-ink">Ask Musicphonetics</h1>
            <p className="text-xs text-ink/60">Free, instant answers about the curriculum, classes and fees.</p>
          </div>
        </div>
      </div>

      {/* Conversation */}
      {msgs.length === 0 ? (
        <div className="rounded-2xl border border-hairline bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">Try asking</p>
          <div className="mt-3 grid gap-2">
            {STARTERS.map((s) => (
              <button key={s} onClick={() => ask(s)}
                className="rounded-xl border border-hairline px-3.5 py-2.5 text-left text-sm text-ink/80 transition-colors hover:border-gold/50 hover:bg-gold/[0.05]">
                {s}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {msgs.map((m, i) => (
            <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
              <div className={cn("max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                m.role === "user" ? "bg-ink text-paper" : "border border-hairline bg-white text-ink/85 whitespace-pre-wrap")}>
                {m.text}
              </div>
            </div>
          ))}
          {busy && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-hairline bg-white px-4 py-3 text-sm text-ink/50">Thinking…</div>
            </div>
          )}
          <div ref={endRef} />
        </div>
      )}

      {err && <p className="rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</p>}

      {/* Composer */}
      <form onSubmit={(e) => { e.preventDefault(); ask(input); }}
        className="sticky bottom-20 lg:bottom-4 flex items-end gap-2 rounded-2xl border border-hairline bg-white p-2 shadow-[0_10px_30px_-18px_rgba(22,27,38,0.3)]">
        <textarea value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input); } }}
          rows={1} placeholder="Ask anything about the classes or curriculum…"
          className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink/40 focus:outline-none" />
        <button type="submit" disabled={busy || !input.trim()}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gold text-ink transition hover:bg-deep-gold disabled:opacity-40">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M4 12l16-8-6 8 6 8-16-8Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" /></svg>
        </button>
      </form>

      <p className="px-1 text-center text-[11px] leading-relaxed text-ink/50">
        AI assistant · general guidance about Musicphonetics. For your child&apos;s specific schedule or account,{" "}
        <a href={whatsappLink("Hi Musicphonetics, I have a question.")} target="_blank" rel="noopener noreferrer" className="font-semibold text-[#7A5E0F] underline underline-offset-2">message us on WhatsApp</a>.
      </p>
    </div>
  );
}
