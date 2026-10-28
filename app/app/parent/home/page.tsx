import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Family home"}
      intent={"Your family at a glance — upcoming lessons, the latest updates from the teacher and each child's recent progress."}
      classicHref={"/parent/dashboard"}
      classicLabel={"Student portal"}
      points={[
    "Upcoming lessons for your children",
    "The latest teacher updates",
    "Each child's recent progress",
    "What to practise this week",
    ]}
    />
  );
}
