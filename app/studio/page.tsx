import { Suspense } from "react";
import { TrialStudio } from "@/components/studio/TrialStudio";

// The Trial Studio is a fully client-rendered, token-driven experience that
// talks to /api/trial/*. Wrapped in Suspense so it statically exports cleanly.
export default function StudioPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <TrialStudio />
    </Suspense>
  );
}
