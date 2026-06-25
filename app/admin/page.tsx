"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminLayout, type AdminTab } from "@/components/admin/AdminLayout";
import { DashboardCards } from "@/components/admin/DashboardCards";
import { PeopleTable } from "@/components/admin/PeopleTable";
import { StudentTable } from "@/components/admin/StudentTable";
import { TeachersTable } from "@/components/admin/TeachersTable";
import { ClassTracker } from "@/components/admin/ClassTracker";
import { PaymentsTable } from "@/components/admin/PaymentsTable";
import { MarketingPanel } from "@/components/admin/MarketingPanel";
import { AutomationMap } from "@/components/admin/AutomationMap";
import { SettingsPanel } from "@/components/admin/SettingsPanel";
import { isAdminAuthed } from "@/lib/admin-auth";

export default function AdminPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState<AdminTab>("overview");

  // Client-side gate (v1). Redirect to login if not authed.
  useEffect(() => {
    if (!isAdminAuthed()) {
      router.replace("/admin/login");
    } else {
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return (
      <div className="grid min-h-screen place-items-center bg-mist text-ink/50">
        Loading portal…
      </div>
    );
  }

  return (
    <AdminLayout active={tab} onChange={setTab}>
      {tab === "overview" && <DashboardCards />}
      {tab === "people" && <PeopleTable />}
      {tab === "students" && <StudentTable />}
      {tab === "teachers" && <TeachersTable />}
      {tab === "classes" && <ClassTracker />}
      {tab === "payments" && <PaymentsTable />}
      {tab === "marketing" && <MarketingPanel />}
      {tab === "automation" && <AutomationMap />}
      {tab === "settings" && <SettingsPanel />}
    </AdminLayout>
  );
}
