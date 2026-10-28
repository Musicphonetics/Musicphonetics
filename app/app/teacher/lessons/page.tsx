import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Lessons & attendance"}
      intent={"Record what happened in each lesson — topics covered, attendance, accuracy, what to practise — linked to the right student and visible to their parent."}
      classicHref={"/teacher/class-update"}
      classicLabel={"Teacher portal"}
      points={[
    "Record a lesson against a student",
    "Mark attendance",
    "Topics, accuracy and struggled areas",
    "Set homework and the next practice",
    ]}
    />
  );
}
