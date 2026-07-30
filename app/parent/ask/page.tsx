"use client";

import { PortalShell } from "@/components/portal/PortalShell";
import { PARENT_TABS } from "@/components/portal/tabs";
import { AskAI } from "@/components/parent/AskAI";

export default function ParentAsk() {
  return (
    <PortalShell role="parent" tabs={PARENT_TABS} title="Ask" subtitle="Student Portal">
      <AskAI />
    </PortalShell>
  );
}
