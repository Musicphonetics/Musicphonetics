import { AppShell } from "@/components/app/AppShell";

export default function ParentAppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell role="parent">{children}</AppShell>;
}
