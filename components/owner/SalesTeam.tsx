"use client";

// Owner-only: invite sales/marketing staff. Creates a role='sales' login (lead
// department access only, never owner). Uses the owner's access token to
// authorise the server call; the service key stays on the server.
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

interface StaffRow { id: string; full_name: string | null; email: string | null; role: string }

export function SalesTeam() {
  const [rows, setRows] = useState<StaffRow[] | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("sales");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [cred, setCred] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await getSupabase().from("profiles").select("id,full_name,email,role").in("role", ["sales", "sales_manager", "marketing"]).order("full_name");
    setRows((data as StaffRow[]) ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function invite() {
    if (name.trim().length < 2 || !/^\S+@\S+\.\S+$/.test(email.trim())) { setMsg("Enter a name and a valid email."); return; }
    setBusy(true); setMsg(null); setCred(null);
    const { data: s } = await getSupabase().auth.getSession();
    const token = s.session?.access_token;
    try {
      const res = await fetch("/api/provision-sales", {
        method: "POST",
        headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ full_name: name.trim(), email: email.trim(), role }),
      });
      const data = await res.json().catch(() => ({ ok: false, error: "Failed" }));
      setBusy(false);
      if (!res.ok || !data.ok) { setMsg(data.error || "Could not create the login."); return; }
      setCred({ email: data.login_email, password: data.temp_password });
      setMsg(data.emailed ? "Invited, a welcome email was sent." : "Created, share the temporary password below.");
      setName(""); setEmail(""); load();
    } catch { setBusy(false); setMsg("Could not reach the server."); }
  }

  return (
    <section className="mt-6 rounded-2xl border border-hairline bg-white p-5">
      <p className="font-display text-lg font-semibold text-ink">Sales &amp; marketing team</p>
      <p className="mt-0.5 text-sm text-ink/60">Invite staff who run the lead department. They can manage leads (assign, contact, follow up, convert) but never see teacher HR/finance, payouts, or company settings.</p>

      <div className="mt-4 flex flex-wrap items-end gap-2">
        <label className="flex-1"><span className="text-xs text-ink/60">Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus:outline-none" /></label>
        <label className="flex-1"><span className="text-xs text-ink/60">Email</span>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-lg border border-hairline bg-white px-3 py-2 text-sm focus:outline-none" /></label>
        <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-hairline bg-white px-2.5 py-2 text-sm focus:outline-none">
          <option value="sales">Sales</option>
          <option value="sales_manager">Sales manager</option>
          <option value="marketing">Marketing</option>
        </select>
        <button onClick={invite} disabled={busy} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">{busy ? "Inviting…" : "Invite"}</button>
      </div>
      {msg && <p className={cn("mt-2 text-xs", cred ? "text-feature-green" : "text-ink/70")}>{msg}</p>}
      {cred && (
        <div className="mt-2 rounded-lg bg-mist px-3 py-2 text-xs text-ink/75">
          Login: <b>{cred.email}</b> · Temporary password: <code className="rounded bg-white px-1 font-mono">{cred.password}</code> · workspace: <b>/sales/login</b>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="mt-4 divide-y divide-hairline">
          {rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-2 py-2.5 text-sm">
              <div><span className="font-medium text-ink">{r.full_name || "-"}</span> <span className="text-ink/50">· {r.email}</span></div>
              <span className="rounded-full bg-forest/12 px-2.5 py-1 text-[11px] font-semibold text-forest">{r.role}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
