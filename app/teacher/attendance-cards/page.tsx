"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase/client";
import type { Student, ClassUpdate, Payment } from "@/lib/supabase/types";
import { groupIntoCycles, type ClassCycle } from "@/lib/cycles";
import { printDoc } from "@/lib/print";

// Attendance Card — a small, print-ready sheet a teacher shares with a parent
// before the next month's payment. It shows ONLY the current fee cycle's classes
// (date + what was taught in short + status) so the parent can confirm the dates.
// Siblings under one parent are combined onto a single sheet.

type ChildCard = { student: Student; cycle: ClassCycle | null };
type Family = { key: string; parent: string; phone: string | null; email: string | null; children: ChildCard[] };

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function fmtD(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
  if (isNaN(d.getTime())) return iso;
  return `${DOW[d.getDay()]} ${d.getDate()} ${MON[d.getMonth()]}`;
}
function statusLabel(c: ClassUpdate): string {
  if (c.class_status === "Completed") return "Present";
  if (c.class_status === "Rescheduled") return "Rescheduled";
  if (c.class_status === "Cancelled") return "Cancelled";
  if (c.class_status === "No-Show") return "No-show";
  return c.class_status || "—";
}
function shortTaught(c: ClassUpdate): string {
  const base = [c.subject, c.taught].filter(Boolean).join(": ").replace(/\s+/g, " ").trim();
  if (!base) return "—";
  return base.length > 80 ? base.slice(0, 79) + "…" : base;
}
function norm(s?: string | null) { return (s || "").toLowerCase().replace(/\s+/g, " ").trim(); }
function phoneKey(s?: string | null) { const d = (s || "").replace(/\D/g, ""); return d.length >= 10 ? d.slice(-10) : ""; }
function titleCase(s: string) { return s.replace(/\b\w/g, (m) => m.toUpperCase()); }

export default function AttendanceCards() {
  const [students, setStudents] = useState<Student[] | null>(null);
  const [classes, setClasses] = useState<ClassUpdate[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setStudents([]); return; }
    const sb = getSupabase();
    (async () => {
      const [sRes, cRes] = await Promise.all([
        sb.from("students").select("*").order("name"),
        sb.from("class_updates").select("id,student_id,class_date,class_status,attendance_status,counts_toward_cycle,taught,subject"),
      ]);
      let pRes = await sb.from("payments").select("student_id,payment_date,amount_paid,classes_included,payment_status,payment_mode");
      if (pRes.error && /classes_included/i.test(pRes.error.message)) {
        pRes = await sb.from("payments").select("student_id,payment_date,amount_paid,payment_status,payment_mode");
      }
      if (sRes.error) { setErr(sRes.error.message); setStudents([]); return; }
      setStudents((sRes.data as Student[]) ?? []);
      setClasses((cRes.data as ClassUpdate[]) ?? []);
      setPayments((pRes.data as Payment[]) ?? []);
    })();
  }, []);

  const families = useMemo<Family[]>(() => {
    if (!students) return [];
    const byStudentClasses = new Map<string, ClassUpdate[]>();
    for (const c of classes) { const a = byStudentClasses.get(c.student_id) ?? []; a.push(c); byStudentClasses.set(c.student_id, a); }
    const byStudentPays = new Map<string, Payment[]>();
    for (const p of payments) { const a = byStudentPays.get(p.student_id) ?? []; a.push(p); byStudentPays.set(p.student_id, a); }

    const map = new Map<string, Family>();
    for (const s of students) {
      if (s.status === "left") continue; // not currently enrolled
      const key = s.parent_id || phoneKey(s.parent_phone) || norm(s.parent_email) || norm(s.parent_name) || s.id;
      const cyc = groupIntoCycles(byStudentClasses.get(s.id) ?? [], byStudentPays.get(s.id) ?? [], s.fee_quoted, s.classes_per_month);
      const current = cyc.length ? cyc[cyc.length - 1] : null;
      const child: ChildCard = { student: s, cycle: current };
      const fam = map.get(key);
      if (fam) fam.children.push(child);
      else map.set(key, {
        key, parent: s.parent_name ? titleCase(s.parent_name) : "Family",
        phone: s.parent_phone ?? null, email: s.parent_email ?? null, children: [child],
      });
    }
    return [...map.values()].sort((a, b) => a.parent.localeCompare(b.parent));
  }, [students, classes, payments]);

  const shown = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return families;
    return families.filter((f) =>
      [f.parent, f.phone, ...f.children.map((c) => c.student.name)].filter(Boolean).join(" ").toLowerCase().includes(n)
    );
  }, [families, q]);

  const selected = useMemo(() => families.find((f) => f.key === sel) ?? null, [families, sel]);

  if (students === null) return <PortalShell role="teacher" tabs={TEACHER_TABS} title="Attendance Cards"><Loading /></PortalShell>;

  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Attendance Cards">
      <div className="mx-auto max-w-3xl px-1">
        <p className="text-sm text-ink/70">
          A one-page attendance sheet to share with a parent before the next month&apos;s payment — this cycle&apos;s class dates,
          what was taught, and status. Siblings are combined on one sheet. Open a family, then <b>Print / Save PDF</b>.
        </p>
        {err && <p className="mt-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{err}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search parent or child…"
            className="min-w-0 flex-1 rounded-lg border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            aria-label="Search families" />
          {families.length > 0 && (
            <button onClick={() => printDoc("attn-all")}
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-paper hover:brightness-110">
              Print all ({families.length})
            </button>
          )}
        </div>

        {families.length === 0 ? (
          <div className="mt-6"><EmptyState title="No students found" hint="Students you teach will appear here once classes are recorded." /></div>
        ) : (
          <div className="mt-4 space-y-2">
            {shown.map((f) => (
              <button key={f.key} onClick={() => setSel(f.key)}
                className={`flex w-full items-center gap-3 rounded-xl border bg-white p-3 text-left transition hover:border-gold/50 ${sel === f.key ? "border-gold" : "border-hairline"}`}>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-ink">{f.parent}</p>
                  <p className="truncate text-xs text-ink/60">{f.children.map((c) => c.student.name).join(" · ")}{f.phone ? ` · ${f.phone}` : ""}</p>
                </div>
                <span className="shrink-0 text-xs font-medium text-ink/55">
                  {f.children.reduce((n, c) => n + (c.cycle?.doneCount ?? 0), 0)} classes
                </span>
              </button>
            ))}
          </div>
        )}

        {selected && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Preview — {selected.parent}</h2>
              <button onClick={() => printDoc("attn-one")}
                className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-ink hover:brightness-105">
                Print / Save PDF
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-hairline bg-white p-2">
              <div id="attn-one"><Card family={selected} /></div>
            </div>
          </div>
        )}

        {/* Off-screen (not display:none, so its HTML prints clean) container used
            only by "Print all" — one family per page. */}
        <div aria-hidden style={{ position: "absolute", left: -99999, top: 0, width: 1, height: 1, overflow: "hidden" }}>
          <div id="attn-all">
            {families.map((f, i) => (
              <div key={f.key} style={{ breakAfter: i < families.length - 1 ? "page" : "auto" }}>
                <Card family={f} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalShell>
  );
}

// The printable sheet. Plain black-on-white, compact, so two children fit on one
// A4 page. Styling is inline so it survives the isolated print window.
function Card({ family }: { family: Family }) {
  const today = new Date();
  const todayStr = `${today.getDate()} ${MON[today.getMonth()]} ${today.getFullYear()}`;
  const wrap: React.CSSProperties = { fontFamily: "Hanken Grotesk, Arial, sans-serif", color: "#161B26", padding: "6px 10px", maxWidth: 760, margin: "0 auto" };
  const th: React.CSSProperties = { textAlign: "left", fontSize: 10, textTransform: "uppercase", letterSpacing: ".04em", color: "#555", borderBottom: "1px solid #ccc", padding: "4px 6px" };
  const td: React.CSSProperties = { fontSize: 12, padding: "3px 6px", borderBottom: "1px solid #eee", verticalAlign: "top" };

  return (
    <div style={wrap}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", borderBottom: "2px solid #161B26", paddingBottom: 6 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: ".02em" }}>MUSICPHONETICS</div>
          <div style={{ fontSize: 12, color: "#444" }}>Attendance Card · current fee cycle</div>
        </div>
        <div style={{ textAlign: "right", fontSize: 11, color: "#555" }}>
          <div><b style={{ color: "#161B26" }}>{family.parent}</b></div>
          {family.phone && <div>{family.phone}</div>}
          <div>Generated {todayStr}</div>
        </div>
      </div>

      {family.children.map((ch) => {
        const cyc = ch.cycle;
        const rows = (cyc?.classes ?? []).slice().sort((a, b) => (a.class_date || "").localeCompare(b.class_date || ""));
        return (
          <div key={ch.student.id} style={{ marginTop: 12, breakInside: "avoid" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
              <div style={{ fontWeight: 700, fontSize: 14 }}>
                {ch.student.name}
                {ch.student.instrument ? <span style={{ fontWeight: 400, color: "#555" }}> · {ch.student.instrument}</span> : null}
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>
                {cyc ? (
                  <>
                    <b style={{ color: "#161B26" }}>{cyc.doneCount} of {cyc.size} classes done</b>
                    {cyc.paid && cyc.paidOn ? ` · paid ₹${(cyc.amount ?? 0).toLocaleString("en-IN")} on ${fmtD(cyc.paidOn)}` : " · payment due"}
                  </>
                ) : "No classes recorded"}
              </div>
            </div>

            {rows.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777", padding: "4px 6px" }}>No classes in this cycle yet.</div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
                <thead>
                  <tr>
                    <th style={{ ...th, width: 22 }}>#</th>
                    <th style={{ ...th, width: 96 }}>Date</th>
                    <th style={th}>What was taught</th>
                    <th style={{ ...th, width: 84 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ ...td, color: "#888" }}>{i + 1}</td>
                      <td style={{ ...td, whiteSpace: "nowrap" }}>{fmtD(c.class_date)}</td>
                      <td style={td}>{shortTaught(c)}</td>
                      <td style={{ ...td, whiteSpace: "nowrap", color: c.class_status === "Completed" ? "#1a7a3a" : "#8a6d1b" }}>
                        {c.class_status === "Completed" ? "✓ " : ""}{statusLabel(c)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        );
      })}

      <div style={{ marginTop: 16, borderTop: "1px dashed #bbb", paddingTop: 8, fontSize: 11, color: "#444", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 12 }}>
        <div style={{ maxWidth: 420 }}>
          Please confirm the class dates above. Once confirmed, kindly proceed with the next month&apos;s payment to continue classes. Thank you.
        </div>
        <div style={{ textAlign: "right" }}>
          Confirmed by parent: ______________________<br />
          <span style={{ fontSize: 10, color: "#777" }}>Signature / “Confirmed” + Date</span>
        </div>
      </div>
    </div>
  );
}
