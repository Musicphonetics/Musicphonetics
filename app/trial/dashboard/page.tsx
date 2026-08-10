import { Suspense } from "react";
import { TrialDashboard } from "@/components/trial/TrialDashboard";

export default function TrialDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <TrialDashboard />
    </Suspense>
  );
}
