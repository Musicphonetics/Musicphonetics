import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Teaching home"}
      intent={"Your day at a glance — today's lessons, the students who need attention, and one-tap actions to record a lesson or update a parent."}
      classicHref={"/teacher/dashboard"}
      classicLabel={"Teacher portal"}
      points={[
    "Today's lessons and attendance to record",
    "Students needing a follow-up",
    "Lesson reports awaiting completion",
    "Quick action: record a lesson",
    ]}
    />
  );
}
