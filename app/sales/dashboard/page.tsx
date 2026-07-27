"use client";

import Link from "next/link";
import { PortalShell } from "@/components/portal/PortalShell";
import { SALES_TABS } from "@/components/portal/tabs";
import { LeadAnalytics } from "@/components/leads/LeadAnalytics";

export default function SalesDashboard() {
  return (
    <PortalShell role="sales" tabs={SALES_TABS} variant="wide" title="Lead department">
      <div className="mb-4 flex flex-wrap gap-3">
        <Link href="/sales/leads" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-paper">Open the lead centre →</Link>
      </div>
      <LeadAnalytics />
      <p className="mt-4 text-xs text-ink/50">You manage the lead pipeline: assign, contact, follow up and convert. You don’t see teacher HR/finance, payouts, or company settings.</p>
    </PortalShell>
  );
}
