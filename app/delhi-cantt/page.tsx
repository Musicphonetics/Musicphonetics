import { Suspense } from "react";
import { DelhiCanttLanding } from "@/components/campaign/DelhiCanttLanding";

// Static export: UTM params are read on the client (useSearchParams) inside the
// landing component, so it is wrapped in a Suspense boundary.
export default function DelhiCanttPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <DelhiCanttLanding />
    </Suspense>
  );
}
