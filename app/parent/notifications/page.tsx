"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { listNotifications, markRead, markAllRead, acknowledge, NOTIF_LABEL } from "@/lib/notify";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import type { Notification } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const when = (iso: string) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function ParentNotifications() {
  const [items, setItems] = useState<Notification[] | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setItems([]); return; }
    listNotifications(80).then(setItems);
  }, []);

  async function open(n: Notification) {
    if (!n.is_read) {
      await (n.must_ack ? acknowledge(n.id) : markRead(n.id));
      setItems((prev) => prev?.map((x) => x.id === n.id ? { ...x, is_read: true } : x) ?? null);
    }
  }
  async function readAll() {
    await markAllRead();
    setItems((prev) => prev?.map((x) => ({ ...x, is_read: true })) ?? null);
  }

  const unread = (items ?? []).filter((n) => !n.is_read).length;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Notifications">
      {!items ? <Loading /> : items.length === 0 ? (
        <EmptyState title="No notifications yet" hint="Class reminders, homework, reports and messages will appear here." />
      ) : (
        <div className="space-y-3">
          {unread > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink/65">{unread} unread</p>
              <button onClick={readAll} className="text-sm font-semibold text-[#7A5E0F]">Mark all read</button>
            </div>
          )}
          {items.map((n) => (
            <button key={n.id} onClick={() => open(n)}
              className={cn("flex w-full gap-3 rounded-2xl border p-4 text-left transition",
                n.is_read ? "border-hairline bg-white" : "border-gold/40 bg-gold/[0.06]")}>
              <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", n.is_read ? "bg-transparent" : n.must_ack ? "bg-red-500" : "bg-gold")} />
              <span className="min-w-0 flex-1">
                <span className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-[#7A5E0F]">{NOTIF_LABEL[n.type] ?? "Notification"}</span>
                  <span className="shrink-0 text-[11px] text-ink/45">{when(n.created_at)}</span>
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-ink">{n.title}</span>
                {n.body && <span className="mt-1 block text-sm leading-relaxed text-ink/70">{n.body}</span>}
                {n.action_url && (
                  <Link href={n.action_url} onClick={(e) => e.stopPropagation()} className="mt-2 inline-block text-sm font-semibold text-[#7A5E0F]">Open →</Link>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
