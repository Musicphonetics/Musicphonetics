import { ModulePage } from "@/components/app/states";

export default function Page() {
  return (
    <ModulePage
      title={"Public profile"}
      intent={"The professional profile families see — instruments, approach, qualifications and media — with a preview before you publish."}
      classicHref={"/teacher/profile"}
      classicLabel={"Teacher portal"}
      points={[
    "Edit your public teaching profile",
    "Instruments, genres and levels",
    "Qualifications and experience",
    "Preview before publishing",
    ]}
    />
  );
}
