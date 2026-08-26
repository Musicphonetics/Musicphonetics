"use client";

import { useEffect, useState } from "react";

// Shows the private iCal subscription link + how to add it to a phone. The token
// authorises the feed; keep it private. Subscribing (not importing) means the
// phone calendar auto-refreshes as classes change.
export function CalendarSubscribe({ token, who = "your" }: { token: string | null; who?: string }) {
  const [host, setHost] = useState("");
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => { setHost(window.location.host); }, []);

  if (!token) return null;
  const path = `/api/calendar?token=${token}`;
  const httpsUrl = host ? `https://${host}${path}` : path;
  const webcalUrl = host ? `webcal://${host}${path}` : path;

  const copy = async () => {
    try { await navigator.clipboard.writeText(httpsUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch { /* clipboard blocked */ }
  };

  return (
    <div className="rounded-2xl border border-gold/40 bg-gold/[0.06] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#7A5E0F]">Sync to your phone</p>
          <p className="mt-1 text-sm text-ink/70">Subscribe once and {who} classes appear in your phone&apos;s calendar, and stay up to date automatically.</p>
        </div>
        <a href={webcalUrl} className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-[#0f131c]">Add to calendar</a>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input readOnly value={httpsUrl} onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 truncate rounded-lg border border-hairline bg-white px-3 py-2 text-xs text-ink/70" />
        <button onClick={copy} className="shrink-0 rounded-lg border border-hairline bg-white px-3 py-2 text-xs font-semibold text-ink/70 hover:bg-mist">
          {copied ? "Copied ✓" : "Copy link"}
        </button>
      </div>

      <button onClick={() => setOpen((v) => !v)} className="mt-3 text-xs font-semibold text-[#7A5E0F]">
        {open ? "Hide setup steps" : "How to add it (iPhone / Google)"}
      </button>
      {open && (
        <div className="mt-2 grid gap-3 text-xs leading-relaxed text-ink/70 sm:grid-cols-2">
          <div className="rounded-xl border border-hairline bg-white p-3">
            <p className="font-semibold text-ink">iPhone / iPad</p>
            <p className="mt-1">Tap <b>Add to calendar</b> above, iOS offers to subscribe. Or: Settings → Calendar → Accounts → Add Account → Other → <b>Add Subscribed Calendar</b> → paste the link.</p>
          </div>
          <div className="rounded-xl border border-hairline bg-white p-3">
            <p className="font-semibold text-ink">Google Calendar</p>
            <p className="mt-1">On a computer: Google Calendar → <b>Other calendars</b> (+) → <b>From URL</b> → paste the link → Add. It then syncs to the Google Calendar app on your phone.</p>
          </div>
        </div>
      )}
      <p className="mt-3 text-[11px] text-ink/45">This link is private to you. Phones refresh subscribed calendars periodically (often a few times a day), so new classes may take a little while to appear.</p>
    </div>
  );
}
