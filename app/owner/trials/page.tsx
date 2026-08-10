import { PortalShell } from "@/components/portal/PortalShell";
import { OWNER_TABS } from "@/components/portal/tabs";
import { OwnerTrials } from "@/components/trial/OwnerTrials";

export default function Page() {
  return (
    <PortalShell role="owner" tabs={OWNER_TABS} variant="wide" title="Trial funnel">
      <OwnerTrials />
    </PortalShell>
  );
}
