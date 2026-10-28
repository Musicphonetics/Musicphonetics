import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Teacher updates"}
      intent={"Structured updates from your child's teacher after each lesson — what went well, what needs work and what to practise next."}
      classicHref={"/parent/classes"}
      classicLabel={"Student portal"}
      points={[
    "A clear update after each lesson",
    "What went well and what to work on",
    "Practice for the coming week",
    "Notifications when a new update arrives",
    ]}
    />
  );
}
