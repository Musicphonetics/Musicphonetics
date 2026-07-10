"use client";

import { useState } from "react";
import { getSupabase } from "@/lib/supabase/client";

// Owner tool: create (or link) a parent login for a student, in one click.
export function ParentLoginModal({ studentId, studentName, defaultEmail, onClose }: {
  studentId: string; studentName: string; defaultEmail?: string | null; onClose: () => void;
}) {
  const [email, setEmail] = useState(defaultEmail || "");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; password: string | null; linkedExisting: boolean } | null>(null);

  async function create() {
    setErr(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { setErr("Enter a valid parent email."); return; }
    setBusy(true);
    const { data: { session } } = await getSupabase().auth.getSession();
    const token = session?.access_token;
    if (!token) { setErr("Please sign in again."); setBusy(false); return; }
    const res = await fetch("/api/provision-parent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ student_id: studentId, email: email.trim() }),
    });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; login_email?: string; temp_password?: string; linked_existing?: boolean; error?: string };
    setBusy(false);
    if (!res.ok || !d.ok) { setErr(d.error || "Could not create the parent login."); return; }
    setResult({ email: d.login_email || email.trim(), password: d.temp_password ?? null, linkedExisting: !!d.linked_existing });
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-ink/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-2xl border border-hairline bg-white p-6">
        <p className="font-display text-lg font-semibold text-ink">Parent login · {studentName}</p>

        {!result ? (
          <>
            <p className="mt-1 text-sm text-ink/65">Create a parent login and link it to this student. If the email already has a login (a sibling&apos;s parent), it links to that account.</p>
            <label className="mt-4 block text-sm font-medium text-ink">Parent email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="parent@email.com"
              className="mt-1.5 w-full rounded-xl border border-hairline bg-white px-4 py-3 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
            {err && <p className="mt-2 text-sm text-red-600">{err}</p>}
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={onClose} className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink/70">Cancel</button>
              <button onClick={create} disabled={busy} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
                {busy ? "Creating…" : "Create & link"}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mt-3 rounded-xl border border-gold/50 bg-gold/[0.07] p-4">
              {result.linkedExisting ? (
                <p className="text-sm text-ink/80">This parent already had a login. It&apos;s now <b>linked</b> to {studentName}. They use their existing password (or &ldquo;Forgot password&rdquo; to reset).</p>
              ) : (
                <>
                  <p className="text-xs font-bold uppercase tracking-wider text-[#7A5E0F]">Share privately with the parent</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p><span className="text-ink/55">Portal:</span> <b>musicphonetics.pages.dev/parent/login</b></p>
                    <p><span className="text-ink/55">Email:</span> <b className="break-all">{result.email}</b></p>
                    <p><span className="text-ink/55">Temporary password:</span> <b>{result.password}</b></p>
                  </div>
                  <p className="mt-2 text-xs text-ink/55">Ask them to change it after first login.</p>
                </>
              )}
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={onClose} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper">Done</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
