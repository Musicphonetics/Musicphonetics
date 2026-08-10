import { PortalShell } from "@/components/portal/PortalShell";
import { TRIAL_TABS } from "@/components/trial/tabs";
import { TrialAsk } from "@/components/trial/TrialExtras";

export default function Page() {
  return (
    <PortalShell role="parent" tabs={TRIAL_TABS} title="Musicphonetics" subtitle="Private Trial Experience">
      <TrialAsk />
    </PortalShell>
  );
}
