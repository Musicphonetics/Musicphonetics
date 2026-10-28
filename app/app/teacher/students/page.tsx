import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"My students"}
      intent={"Every student assigned to you — searchable and filterable — with their next lesson and anything outstanding. You only ever see your own students."}
      classicHref={"/teacher/students"}
      classicLabel={"Teacher portal"}
      points={[
    "Search and filter your students",
    "Each student's next lesson and status",
    "Outstanding lesson reports and practice reviews",
    "Open a full student record",
    ]}
    />
  );
}
