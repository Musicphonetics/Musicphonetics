"use client";

import { useState } from "react";
import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { LeadsCentre } from "@/components/leads/LeadsCentre";
import { QuickLead } from "@/components/owner/QuickLead";

export default function OwnerLeads() {
  const [refresh, setRefresh] = useState(0);
  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Leads">
      <QuickLead onCreated={() => setRefresh((n) => n + 1)} />
      <LeadsCentre key={refresh} />
    </PortalShell>
  );
}
