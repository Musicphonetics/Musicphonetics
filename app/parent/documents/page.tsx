"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { Loading, EmptyState } from "@/components/portal/kit";
import { isSupabaseConfigured, getSupabase } from "@/lib/supabase/client";
import { loadParentData, type ParentData } from "@/lib/supabase/parent";
import type { StudentDocument } from "@/lib/supabase/types";

const DOC_LABEL: Record<string, string> = {
  enrolment_confirmation: "Enrolment confirmation", enrolment_agreement: "Enrolment agreement",
  invoice: "Invoice", receipt: "Receipt", monthly_report: "Monthly report", progress_report: "Progress report",
  certificate: "Certificate", uploaded_document: "Document", internal_document: "Document",
};
const when = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function ParentDocuments() {
  const [data, setData] = useState<ParentData | null>(null);
  const [docs, setDocs] = useState<StudentDocument[]>([]);

  useEffect(() => {
    if (!isSupabaseConfigured()) { setData({ students: [], classes: [], payments: [], teachers: {}, error: null }); return; }
    loadParentData().then(setData);
    getSupabase().from("student_documents").select("*").order("created_at", { ascending: false })
      .then(({ data }) => setDocs((data as StudentDocument[]) ?? []));
  }, []);

  const hasReceipts = (data?.payments.length ?? 0) > 0;

  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Documents">
      {!data ? <Loading /> : (
        <div className="space-y-4">
          {/* Standing documents everyone has */}
          <div className="space-y-2.5">
            <DocLink title="Enrolment Agreement & Acknowledgement" sub="The terms you agreed to at enrolment" href="/enrolment-agreement" />
            {hasReceipts && <DocLink title="Fee receipts" sub="Print any payment receipt" href="/parent/payments" />}
            <DocLink title="Monthly progress reports" sub="Published reports from your teacher" href="/parent/reports" />
          </div>

          {/* Any documents the office shared for this student */}
          {docs.length > 0 && (
            <div>
              <p className="mb-2 mt-4 text-xs font-semibold uppercase tracking-wide text-ink/55">Shared with you</p>
              <div className="space-y-2.5">
                {docs.map((d) => (
                  <a key={d.id} href={d.document_url || d.internal_route || "#"} target={d.document_url ? "_blank" : undefined} rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-2xl border border-hairline bg-white p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">{d.title}</p>
                      <p className="text-xs text-ink/60">{DOC_LABEL[d.type] || "Document"} · {when(d.created_at)}</p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-[#7A5E0F]">Open →</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {docs.length === 0 && !hasReceipts && (
            <EmptyState title="Your documents" hint="Your enrolment agreement and reports are always here; receipts and certificates appear as they're issued." />
          )}
        </div>
      )}
    </PortalShell>
  );
}

function DocLink({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between rounded-2xl border border-hairline bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/12 text-[#7A5E0F]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h7l5 5v11a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM14 3v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </span>
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="text-xs text-ink/60">{sub}</p>
        </div>
      </div>
      <span className="text-sm font-semibold text-[#7A5E0F]">Open →</span>
    </Link>
  );
}
