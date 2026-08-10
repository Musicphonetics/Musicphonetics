import { PortalShell } from "@/components/portal/PortalShell";
import { TRIAL_TABS } from "@/components/trial/tabs";
import { TrialJourney } from "@/components/trial/TrialJourney";

export default function Page() {
  return (
    <PortalShell role="parent" tabs={TRIAL_TABS} title="Musicphonetics" subtitle="Private Trial Experience">
      <TrialJourney />
    </PortalShell>
  );
}
