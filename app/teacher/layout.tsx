import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Teacher OS",
  robots: { index: false, follow: false },
};

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return children;
}
