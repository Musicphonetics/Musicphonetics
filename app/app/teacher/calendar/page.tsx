import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Calendar"}
      intent={"Your schedule and availability — upcoming lessons, open slots and reschedule requests, with conflict handling."}
      classicHref={"/teacher/calendar"}
      classicLabel={"Teacher portal"}
      points={[
    "Day and week views of your lessons",
    "Set your availability",
    "Confirmed lessons and reschedules",
    "Conflict detection",
    ]}
    />
  );
}
