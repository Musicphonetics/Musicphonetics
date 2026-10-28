import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Enquiries"}
      intent={"New student enquiries and trial requests, each with its status and your next action — so nothing slips."}
      classicHref={"/teacher/leads"}
      classicLabel={"Teacher portal"}
      points={[
    "Incoming enquiries and trial requests",
    "Status and next action for each",
    "Respond without losing the thread",
    "Convert an enquiry to a student",
    ]}
    />
  );
}
