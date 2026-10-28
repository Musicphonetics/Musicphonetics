import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Discover teachers"}
      intent={"Find and enquire with teachers for your family, by instrument, format and area."}
      classicHref={"/teachers"}
      classicLabel={"teacher directory"}
      points={[
    "Browse teachers by instrument and area",
    "See experience and teaching format",
    "Read what a profile really offers",
    "Send an enquiry",
    ]}
    />
  );
}
