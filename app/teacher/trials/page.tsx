import { PortalShell } from "@/components/portal/PortalShell";
import { TEACHER_TABS } from "@/components/portal/tabs";
import { TeacherTrials } from "@/components/trial/TeacherTrials";

export default function Page() {
  return (
    <PortalShell role="teacher" tabs={TEACHER_TABS} title="Musicphonetics" subtitle="Teacher">
      <TeacherTrials />
    </PortalShell>
  );
}
