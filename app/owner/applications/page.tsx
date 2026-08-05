"use client";

import { useEffect, useState, type ReactNode } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { OfferLetter } from "@/components/teach/OfferLetter";
import { JoiningLetter } from "@/components/teach/JoiningLetter";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface AppRow {
  id: string; ref: string | null; status: string; created_at: string; teacher_id: string | null;
  full_name: string; email: string; phone: string | null; dob: string | null; gender: string | null;
  city: string | null; address: string | null; languages: string | null;
  instruments: string[] | null; years_teaching: string | null; years_performing: string | null;
  qualification: string | null; grade: string | null;
  commitment: string | null; days: string[] | null; time_bands: string[] | null; modes: string[] | null; areas: string[] | null; transport: string | null;
  bank_holder: string | null; bank_name: string | null; bank_account: string | null; bank_ifsc: string | null; bank_upi: string | null;
  why_join: string | null;
  offer_sent_at: string | null; offer_accepted_at: string | null; joining_sent_at: string | null;
}

const s = (v?: string | null) => v ?? "";
const arr = (v?: string[] | null) => v ?? [];

export default function OwnerApplications() {
  const [rows, setRows] = useState<AppRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [sel, setSel] = useState<AppRow | null>(null);
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState<"offer" | "joining">("offer");
  const [creds, setCreds] = useState<{ email: string; password: string; teacherId: string } | null>(null);
  const [recipient, setRecipient] = useState("");
  const [sending, setSending] = useState<null | "offer" | "joining">(null);
  const [sendMsg, setSendMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function load() {
    if (!isSupabaseConfigured()) return;
    const { data, error } = await getSupabase()
      .from("teacher_applications").select("*").order("created_at", { ascending: false });
    if (error) setErr(error.message);
    const list = (data as AppRow[]) ?? [];
    setRows(list);
    // Keep the open application in sync (e.g. acceptance arriving after a refresh).
    setSel((cur) => (cur ? list.find((r) => r.id === cur.id) ?? cur : cur));
  }
  useEffect(() => { load(); }, []);

  function open(a: AppRow) { setSel(a); setCreds(null); setSendMsg(null); setRecipient(a.email || ""); }

  // Email the offer or joining document via the staged onboarding flow.
  async function sendDoc(app: AppRow, which: "offer" | "joining") {
    setSending(which); setSendMsg(null); setErr(null);
    const { data: { session } } = await getSupabase().auth.getSession();
    const token = session?.access_token;
    if (!token) { setErr("Please sign in again."); setSending(null); return; }
    const res = await fetch("/api/send-offer", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ application_id: app.id, doc: which, email: recipient.trim() || app.email }),
    });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; to?: string; temp_password?: string; error?: string };
    setSending(null);
    if (!res.ok || !d.ok) { setSendMsg({ ok: false, text: d.error || "Could not send the email." }); return; }
    setSendMsg({ ok: true, text: which === "offer"
      ? `Offer letter emailed to ${d.to}. They'll tap “Accept my offer” in the email.`
      : `Joining agreement + login emailed to ${d.to}.` });
    if (which === "joining" && d.temp_password) setCreds((c) => (c ? { ...c, password: d.temp_password! } : c));
    const stamp = new Date().toISOString();
    setSel((s) => (s && s.id === app.id ? { ...s, ...(which === "offer" ? { offer_sent_at: stamp } : { joining_sent_at: stamp }) } : s));
  }

  async function approve(app: AppRow) {
    setBusy(true); setErr(null); setCreds(null);
    const { data: { session } } = await getSupabase().auth.getSession();
    const token = session?.access_token;
    if (!token) { setErr("Please sign in again."); setBusy(false); return; }
    const res = await fetch("/api/approve-teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ application_id: app.id }),
    });
    const d = (await res.json().catch(() => ({}))) as { ok?: boolean; login_email?: string; temp_password?: string; teacher_id?: string; error?: string };
    setBusy(false);
    if (!res.ok || !d.ok) { setErr(d.error || "Could not approve."); return; }
    setCreds({ email: d.login_email || app.email, password: d.temp_password || "", teacherId: d.teacher_id || "" });
    setSel({ ...app, status: "approved", teacher_id: d.teacher_id || null });
    load();
  }

  const pending = (rows ?? []).filter((r) => r.status === "pending");
  const others = (rows ?? []).filter((r) => r.status !== "pending");

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Applications">
      {err && <div className="mb-4 rounded-xl border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</div>}

      {!rows ? <Loading /> : sel ? (
        <div>
          <button onClick={() => { setSel(null); setCreds(null); }} className="mb-4 text-sm font-semibold text-ink/70 hover:text-ink">← All applications</button>

          {/* Full application incl. bank */}
          <div className="rounded-2xl border border-hairline bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">{sel.full_name}</h2>
                <p className="mt-0.5 text-sm text-ink/60">{sel.email} · {s(sel.phone) || "-"} · {arr(sel.instruments).join(", ") || "-"}</p>
              </div>
              <span className={cn("rounded-full px-3 py-1 text-xs font-semibold",
                sel.status === "approved" ? "bg-feature-green/10 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>{sel.status}</span>
            </div>
            <div className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
              <Cell k="City" v={s(sel.city)} /><Cell k="DOB" v={s(sel.dob)} />
              <Cell k="Address" v={s(sel.address)} span /><Cell k="Languages" v={s(sel.languages)} />
              <Cell k="Years teaching" v={s(sel.years_teaching)} /><Cell k="Years performing" v={s(sel.years_performing)} />
              <Cell k="Qualification" v={s(sel.qualification)} /><Cell k="Grade" v={s(sel.grade)} />
              <Cell k="Commitment" v={s(sel.commitment)} /><Cell k="Transport" v={s(sel.transport)} />
              <Cell k="Days" v={arr(sel.days).join(", ")} span /><Cell k="Time bands" v={arr(sel.time_bands).join(", ")} span />
              <Cell k="Modes" v={arr(sel.modes).join(", ")} /><Cell k="Areas" v={arr(sel.areas).join(", ")} />
              <Cell k="Why join" v={s(sel.why_join)} span />
            </div>
            <div className="mt-4 rounded-xl border border-hairline bg-paper p-4">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-ink/60">Bank / payout details</p>
              <div className="grid gap-x-8 gap-y-2 sm:grid-cols-2">
                <Cell k="Account holder" v={s(sel.bank_holder)} /><Cell k="Bank" v={s(sel.bank_name)} />
                <Cell k="Account number" v={s(sel.bank_account)} /><Cell k="IFSC" v={s(sel.bank_ifsc)} />
                <Cell k="UPI" v={s(sel.bank_upi)} />
              </div>
            </div>

            {sel.status !== "approved" && (
              <button onClick={() => approve(sel)} disabled={busy}
                className="mt-5 inline-flex min-h-[48px] items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-paper hover:bg-[#0f131c] disabled:opacity-50">
                {busy ? "Approving…" : "Approve → create teacher login"}
              </button>
            )}
          </div>

          {/* Credentials to share (owner-only screen) */}
          {creds && (
            <div className="mt-5 rounded-2xl border border-gold/50 bg-gold/[0.07] p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-[#7A5E0F]">Login created · share with the teacher privately</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Cred k="Portal" v="musicphonetics.pages.dev/teacher/login" />
                <Cred k="Login email" v={creds.email} />
                <Cred k="Temporary password" v={creds.password} />
              </div>
              <p className="mt-2 text-xs text-ink/60">These are shown once. The joining email below also delivers the password to the teacher directly.</p>
            </div>
          )}

          {/* Staged onboarding: send offer → teacher accepts → send joining → assign leads */}
          <div className="mt-6 rounded-2xl border border-hairline bg-white p-5">
            <p className="font-display text-lg font-semibold text-ink">Send onboarding documents</p>
            <p className="mt-0.5 text-sm text-ink/60">Just send the offer. When the teacher taps <b>“I accept”</b>, their login is created and the joining agreement + temporary password are emailed to them automatically.</p>

            <label className="mt-4 block text-[11px] font-semibold uppercase tracking-wide text-ink/55">Recipient email</label>
            <input value={recipient} onChange={(e) => setRecipient(e.target.value)} type="email" placeholder="teacher@email.com"
              className="mt-1 w-full max-w-sm rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />

            {sendMsg && (
              <div className={cn("mt-3 rounded-xl border p-3 text-sm", sendMsg.ok ? "border-feature-green/30 bg-feature-green/10 text-feature-green" : "border-red-300 bg-red-50 text-red-700")}>
                {sendMsg.text}
              </div>
            )}

            <ol className="mt-4 space-y-3">
              {/* Step 1 — offer */}
              <Step n={1} title="Send the offer letter" done={!!sel.offer_sent_at}
                sub={sel.offer_sent_at ? `Sent ${fmt(sel.offer_sent_at)}` : "Includes an “Accept my offer” button."}>
                <button onClick={() => sendDoc(sel, "offer")} disabled={sending !== null}
                  className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-paper hover:bg-[#0f131c] disabled:opacity-50">
                  {sending === "offer" ? "Sending…" : sel.offer_sent_at ? "Resend offer" : "Send offer letter"}
                </button>
              </Step>

              {/* Step 2 — acceptance (auto-provisions the login + emails credentials) */}
              <Step n={2} title="Teacher accepts → login auto-created" done={!!sel.offer_accepted_at}
                sub={sel.offer_accepted_at
                  ? `Accepted ${fmt(sel.offer_accepted_at)} · login created & credentials emailed`
                  : "When they tap Accept, their login is created and the joining agreement + password are emailed automatically."}>
                {!sel.offer_accepted_at && (
                  <button onClick={() => load()} className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink/70 hover:text-ink">
                    Refresh
                  </button>
                )}
              </Step>

              {/* Step 3 — joining (optional re-send; happens automatically on acceptance) */}
              <Step n={3} title="Joining agreement + login" done={!!sel.joining_sent_at}
                sub={sel.joining_sent_at ? `Sent ${fmt(sel.joining_sent_at)} · re-send only if needed`
                  : sel.status !== "approved" ? "Sent automatically when they accept. Or approve now to create the login, then re-send here."
                  : "Sent automatically on acceptance — use this only to re-send with a fresh password."}>
                <button onClick={() => sendDoc(sel, "joining")} disabled={sending !== null || sel.status !== "approved"}
                  className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink/70 hover:text-ink disabled:opacity-50">
                  {sending === "joining" ? "Sending…" : "Re-send joining + login"}
                </button>
              </Step>

              {/* Step 4 — leads */}
              <Step n={4} title="Assign their first leads" done={false}
                sub="Once they've joined, send students their way from Leads.">
                <a href="/owner/leads" className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink/70 hover:text-ink">
                  Open Leads →
                </a>
              </Step>
            </ol>
          </div>

          {/* Documents for this applicant */}
          {(sel.status === "approved" || creds) && (() => {
            const docData = {
              fullName: s(sel.full_name), dob: s(sel.dob), gender: s(sel.gender), city: s(sel.city), address: s(sel.address),
              phone: s(sel.phone), email: s(sel.email), languages: s(sel.languages),
              instruments: arr(sel.instruments), yearsTeaching: s(sel.years_teaching), yearsPerforming: s(sel.years_performing),
              qualification: s(sel.qualification), grade: s(sel.grade),
              commitment: s(sel.commitment), days: arr(sel.days), timeBands: arr(sel.time_bands), modes: arr(sel.modes), areas: arr(sel.areas), transport: s(sel.transport),
              bankHolder: s(sel.bank_holder), bankName: s(sel.bank_name), bankAccount: s(sel.bank_account), bankIfsc: s(sel.bank_ifsc), bankUpi: s(sel.bank_upi),
            };
            const loginEmail = creds?.email ?? sel.email;
            const agreementId = sel.teacher_id ?? creds?.teacherId ?? null;
            return (
              <div className="mt-6">
                <div className="mb-4 inline-flex rounded-full border border-hairline bg-white p-1">
                  <button onClick={() => setDoc("offer")}
                    className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition", doc === "offer" ? "bg-ink text-paper" : "text-ink/60 hover:text-ink")}>
                    Offer letter
                  </button>
                  <button onClick={() => setDoc("joining")}
                    className={cn("rounded-full px-4 py-1.5 text-sm font-semibold transition", doc === "joining" ? "bg-ink text-paper" : "text-ink/60 hover:text-ink")}>
                    Joining agreement
                  </button>
                </div>
                {doc === "offer"
                  ? <OfferLetter data={docData} loginEmail={loginEmail} agreementId={agreementId} />
                  : <JoiningLetter data={docData} loginEmail={loginEmail} agreementId={agreementId} />}
              </div>
            );
          })()}
        </div>
      ) : (rows.length === 0) ? (
        <EmptyState title="No applications yet" hint="Applications from the Apply Now form will appear here for your review." />
      ) : (
        <>
          <p className="mb-2 text-sm font-semibold text-ink">Pending review ({pending.length})</p>
          <div className="space-y-2.5">
            {pending.map((a) => <AppCard key={a.id} a={a} onOpen={() => open(a)} />)}
            {pending.length === 0 && <p className="rounded-2xl border border-hairline bg-white p-5 text-sm text-ink/55">Nothing pending.</p>}
          </div>
          {others.length > 0 && (
            <>
              <p className="mb-2 mt-8 text-sm font-semibold text-ink">Processed</p>
              <div className="space-y-2.5">
                {others.map((a) => <AppCard key={a.id} a={a} onOpen={() => open(a)} />)}
              </div>
            </>
          )}
        </>
      )}
    </PortalShell>
  );
}

function AppCard({ a, onOpen }: { a: AppRow; onOpen: () => void }) {
  return (
    <button onClick={onOpen} className="flex w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-hairline bg-white p-4 text-left hover:shadow-card">
      <div className="min-w-0">
        <p className="font-semibold text-ink">{a.full_name}</p>
        <p className="mt-0.5 text-xs text-ink/60">{a.email} · {arr(a.instruments).join(", ") || "-"}</p>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-ink/50">{new Date(a.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
        <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold",
          a.status === "approved" ? "bg-feature-green/10 text-feature-green" : a.status === "rejected" ? "bg-mist text-ink/50" : "bg-gold/15 text-[#7A5E0F]")}>{a.status}</span>
        <span className="text-xs font-semibold text-[#7A5E0F]">Review →</span>
      </div>
    </button>
  );
}

function Cell({ k, v, span }: { k: string; v: string; span?: boolean }) {
  return (
    <div className={span ? "sm:col-span-2" : ""}>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">{k}</p>
      <p className="mt-0.5 text-sm font-medium text-ink">{v || "-"}</p>
    </div>
  );
}
function Cred({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-ink/50">{k}</p>
      <p className="mt-0.5 break-all text-sm font-semibold text-ink">{v}</p>
    </div>
  );
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
}

function Step({ n, title, sub, done, children }: { n: number; title: string; sub: string; done: boolean; children?: ReactNode }) {
  return (
    <li className={cn("flex flex-wrap items-center gap-3 rounded-xl border p-3", done ? "border-feature-green/30 bg-feature-green/[0.05]" : "border-hairline")}>
      <span className={cn("grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-bold", done ? "bg-feature-green/15 text-feature-green" : "bg-gold/15 text-[#7A5E0F]")}>
        {done ? "✓" : n}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{title}</p>
        <p className="mt-0.5 text-xs text-ink/60">{sub}</p>
      </div>
      {children}
    </li>
  );
}
