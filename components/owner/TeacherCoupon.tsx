"use client";

// Owner-only commercial control: a teacher's discount coupon (codes only).
// The percent lives on the code; teachers can read but never edit it.
import { useCallback, useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { normalizeCode, suggestCode, breakdownLabel, applyCoupon, type TeacherCoupon } from "@/lib/coupon";
import { PROGRAM_PRICES } from "@/lib/pricing";
import { cn } from "@/lib/utils";

export function TeacherCouponCard({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const [coupon, setCoupon] = useState<TeacherCoupon | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [code, setCode] = useState("");
  const [pct, setPct] = useState(10);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { data } = await getSupabase()
      .from("teacher_coupons").select("*").eq("teacher_id", teacherId)
      .order("active", { ascending: false }).limit(1).maybeSingle();
    const c = (data as TeacherCoupon | null) ?? null;
    setCoupon(c);
    setCode(c?.code ?? suggestCode(teacherName, 10));
    setPct(c?.discount_percent ?? 10);
    setLoaded(true);
  }, [teacherId, teacherName]);
  useEffect(() => { load(); }, [load]);

  async function save() {
    const clean = normalizeCode(code);
    if (clean.length < 3) { setMsg("Enter a code of at least 3 characters."); return; }
    if (pct < 1 || pct > 100) { setMsg("Discount must be between 1 and 100%."); return; }
    setBusy(true); setMsg(null);
    const sb = getSupabase();
    const { data: u } = await sb.auth.getUser();
    const row = { code: clean, teacher_id: teacherId, discount_percent: pct, active: true, label: `${teacherName} · ${pct}%`, updated_at: new Date().toISOString() };
    const res = coupon
      ? await sb.from("teacher_coupons").update(row).eq("id", coupon.id)
      : await sb.from("teacher_coupons").insert({ ...row, created_by: u.user?.id ?? null });
    setBusy(false);
    if (res.error) { setMsg(res.error.message.includes("duplicate") ? "That code is already used by another teacher." : res.error.message); return; }
    setMsg("Saved."); load();
  }

  async function toggleActive() {
    if (!coupon) return;
    setBusy(true); setMsg(null);
    const { error } = await getSupabase().from("teacher_coupons").update({ active: !coupon.active, updated_at: new Date().toISOString() }).eq("id", coupon.id);
    setBusy(false);
    if (error) { setMsg(error.message); return; }
    load();
  }

  const preview = applyCoupon(PROGRAM_PRICES.main ?? 15000, pct, code);

  return (
    <div className="rounded-2xl border border-hairline bg-white p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-display text-base font-semibold text-ink">Teacher coupon <span className="font-normal text-ink/50">· commercial</span></p>
        {coupon && (
          <span className={cn("rounded-full px-3 py-1 text-xs font-semibold", coupon.active ? "bg-feature-green/12 text-feature-green" : "bg-mist text-ink/55")}>
            {coupon.active ? "Active" : "Inactive"}
          </span>
        )}
      </div>

      {!loaded ? (
        <p className="mt-3 text-sm text-ink/50">Loading…</p>
      ) : (
        <>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-ink/70">Coupon code</span>
              <input value={code} onChange={(e) => setCode(normalizeCode(e.target.value))}
                placeholder="e.g. ISAAC20"
                className="w-full rounded-xl border border-hairline bg-white px-3 py-2.5 font-mono text-sm uppercase focus:outline-none focus-visible:outline-2 focus-visible:outline-gold" />
            </label>
            <div>
              <span className="mb-1 block text-xs font-medium text-ink/70">Discount %</span>
              <div className="flex gap-2">
                {[10, 20].map((p) => (
                  <button key={p} type="button" onClick={() => { setPct(p); setCode((c) => normalizeCode(c).replace(/\d+$/, "") + p); }}
                    className={cn("flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition",
                      pct === p ? "border-gold bg-gold/15 text-[#7A5E0F]" : "border-hairline text-ink/70 hover:border-gold/50")}>
                    {p}%
                  </button>
                ))}
                <input type="number" min={1} max={100} value={pct} onChange={(e) => setPct(Math.round(Number(e.target.value) || 0))}
                  className="w-16 rounded-xl border border-hairline bg-white px-2 py-2.5 text-center text-sm focus:outline-none" />
              </div>
            </div>
          </div>

          <p className="mt-3 rounded-xl bg-mist px-3 py-2 text-xs text-ink/70">
            On Main Pathway: <b className="text-ink">{breakdownLabel(preview)}</b>
          </p>
          {msg && <p className={cn("mt-2 text-xs", msg === "Saved." ? "text-feature-green" : "text-red-600")}>{msg}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            <button disabled={busy} onClick={save} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper disabled:opacity-50">
              {busy ? "Saving…" : coupon ? "Update coupon" : "Create coupon"}
            </button>
            {coupon && (
              <button disabled={busy} onClick={toggleActive} className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink/70 disabled:opacity-50">
                {coupon.active ? "Deactivate" : "Reactivate"}
              </button>
            )}
          </div>
          <p className="mt-2 text-[11px] text-ink/45">Teachers can see their code but cannot change it. The discount is re-validated on the server at payment.</p>
        </>
      )}
    </div>
  );
}
