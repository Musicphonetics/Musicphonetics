"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { listNotifications, unreadCount, markRead, markAllRead, acknowledge } from "@/lib/notify";
import type { Notification } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const timeAgo = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
};

// A notification bell + dropdown that works in any portal. `tone` adapts it to
// a dark (owner/night) or light header. Reads/writes go through RLS.
export function NotificationBell({ tone = "light", allHref }: { tone?: "dark" | "light"; allHref?: string }) {
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(0);
  const [items, setItems] = useState<Notification[] | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    unreadCount().then((c) => alive && setCount(c));
    const t = setInterval(() => unreadCount().then((c) => alive && setCount(c)), 60000);
    return () => { alive = false; clearInterval(t); };
  }, []);

  useEffect(() => {
    if (!open) return;
    listNotifications(20).then(setItems);
    const onClick = (e: MouseEvent) => { if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function openItem(n: Notification) {
    if (!n.is_read) { await (n.must_ack ? acknowledge(n.id) : markRead(n.id)); setCount((c) => Math.max(0, c - 1)); setItems((prev) => prev?.map((x) => x.id === n.id ? { ...x, is_read: true } : x) ?? null); }
    if (n.action_url) { setOpen(false); router.push(n.action_url); }
  }
  async function readAll() {
    await markAllRead(); setCount(0);
    setItems((prev) => prev?.map((x) => ({ ...x, is_read: true })) ?? null);
  }

  const dark = tone === "dark";
  return (
    <div ref={boxRef} className="relative">
      <button type="button" aria-label="Notifications" onClick={() => setOpen((v) => !v)}
        className={cn("relative grid h-9 w-9 place-items-center rounded-full border transition",
          dark ? "border-white/15 text-paper/80 hover:text-paper" : "border-hairline text-ink/70 hover:text-ink")}>
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6ZM10 20a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-[16px] place-items-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">{count > 9 ? "9+" : count}</span>}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-[320px] max-w-[86vw] overflow-hidden rounded-2xl border border-hairline bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
            <p className="text-sm font-semibold text-ink">Notifications</p>
            {count > 0 && <button onClick={readAll} className="text-xs font-semibold text-[#7A5E0F]">Mark all read</button>}
          </div>
          <div className="max-h-[60vh] overflow-y-auto">
            {!items ? (
              <p className="px-4 py-6 text-center text-sm text-ink/50">Loading…</p>
            ) : items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-ink/55">You&apos;re all caught up.</p>
            ) : items.map((n) => (
              <button key={n.id} onClick={() => openItem(n)}
                className={cn("flex w-full gap-2.5 border-b border-hairline/70 px-4 py-3 text-left transition hover:bg-paper", !n.is_read && "bg-gold/[0.05]")}>
                <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.is_read ? "bg-transparent" : n.must_ack ? "bg-red-500" : "bg-gold")} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-semibold text-ink">{n.title}</span>
                    <span className="shrink-0 text-[10px] text-ink/45">{timeAgo(n.created_at)}</span>
                  </span>
                  {n.body && <span className="mt-0.5 block line-clamp-2 text-xs text-ink/65">{n.body}</span>}
                  {n.must_ack && !n.is_read && <span className="mt-1 inline-block rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-red-600">Please acknowledge</span>}
                </span>
              </button>
            ))}
          </div>
          {allHref && (
            <Link href={allHref} onClick={() => setOpen(false)} className="block border-t border-hairline px-4 py-2.5 text-center text-sm font-semibold text-[#7A5E0F]">
              See all
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
