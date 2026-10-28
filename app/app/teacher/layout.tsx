import { AppShell } from "@/components/app/AppShell";

export default function TeacherAppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="teacher">{children}</AppShell>;
}
