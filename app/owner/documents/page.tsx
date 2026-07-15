"use client";

import { useEffect, useMemo, useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadOwnerData } from "@/lib/supabase/owner";
import type { StudentDocument } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

const when = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
const VIS_LABEL: Record<string, string> = { owner_only: "Owner only", owner_teacher: "Owner + teacher", parent_visible: "Family visible" };

export default function OwnerDocuments() {
  const [docs, setDocs] = useState<StudentDocument[] | null>(null);
  const [names, setNames] = useState<Record<string, { name: string; code: string | null }>>({});
  const [q, setQ] = useState("");

  useEffect(() => {
    if (!isSupabaseConfigured()) { setDocs([]); return; }
    getSupabase().from("student_documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setDocs((data as StudentDocument[]) ?? []));
    loadOwnerData().then((d) => setNames(Object.fromEntries(d.students.map((s) => [s.id, { name: s.name, code: s.student_code ?? null }]))));
  }, []);

  const filtered = useMemo(() => (docs ?? []).filter((d) => {
    const needle = q.trim().toLowerCase();
    if (!needle) return true;
    return [d.title, d.type, names[d.student_id]?.name, names[d.student_id]?.code].filter(Boolean).join(" ").toLowerCase().includes(needle);
  }), [docs, q, names]);

  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Documents">
      <p className="-mt-2 mb-4 max-w-2xl text-sm text-ink/60">Every student&apos;s documents in one place. Generated receipts, invoices and monthly reports live in their own sections; uploaded and shared documents appear here. Private files are never exposed through public URLs.</p>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by student, code or title…"
        className="mb-4 w-full max-w-md rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />

      {!docs ? <Loading /> : filtered.length === 0 ? (
        <EmptyState title="No documents yet" hint="Documents attached to a student will appear here." />
      ) : (
        <div className="space-y-2">
          {filtered.map((d) => (
            <div key={d.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-hairline bg-white p-3.5">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{d.title}</p>
                <p className="text-xs text-ink/60">{names[d.student_id]?.name || "Student"}{names[d.student_id]?.code ? ` · ${names[d.student_id]?.code}` : ""} · {d.type.replace(/_/g, " ")} · {when(d.created_at)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("rounded-full px-2.5 py-0.5 text-[11px] font-semibold", d.visibility === "parent_visible" ? "bg-feature-green/12 text-feature-green" : d.visibility === "owner_only" ? "bg-ink/10 text-ink/60" : "bg-gold/15 text-[#7A5E0F]")}>{VIS_LABEL[d.visibility] || d.visibility}</span>
                {(d.document_url || d.internal_route) && <a href={d.document_url || d.internal_route || "#"} target={d.document_url ? "_blank" : undefined} rel="noopener noreferrer" className="text-sm font-semibold text-[#7A5E0F]">Open →</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </PortalShell>
  );
}
