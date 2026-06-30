import { Suspense } from "react";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";

// Static export: the chosen instrument arrives as a ?instrument= query param
// and is read on the client (useSearchParams) inside OnboardingFlow.
export default function StartPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink" />}>
      <OnboardingFlow />
    </Suspense>
  );
}
