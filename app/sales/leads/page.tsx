"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { SALES_TABS } from "@/components/portal/tabs";
import { LeadsCentre } from "@/components/leads/LeadsCentre";

export default function SalesLeads() {
  return (
    <PortalShell role="sales" tabs={SALES_TABS} variant="wide" title="Leads">
      <LeadsCentre />
    </PortalShell>
  );
}
