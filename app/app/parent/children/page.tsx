import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Your children"}
      intent={"Each authorised child's learning record — lessons, attendance, practice and progress — kept separate and private to your family."}
      classicHref={"/parent/progress"}
      classicLabel={"Student portal"}
      points={[
    "Switch between your linked children",
    "Lesson history and attendance",
    "Practice assignments and progress",
    "Milestones and goals",
    ]}
    />
  );
}
