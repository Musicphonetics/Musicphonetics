import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Family settings"}
      intent={"Your family account — linked children, contact details, payments and notification preferences."}
      classicHref={"/parent/dashboard"}
      classicLabel={"Student portal"}
      points={[
    "Your family account details",
    "Linked children and permissions",
    "Payments and receipts",
    "Notification preferences",
    ]}
    />
  );
}
