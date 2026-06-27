import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { INSTRUMENT_VALUES } from "@/lib/onboarding";

export default function StartPage({
  searchParams,
}: {
  searchParams: { instrument?: string };
}) {
  // Only accept a known instrument so the hero can deep-link straight past the
  // instrument step. Anything else falls back to the full flow.
  const instrument =
    searchParams.instrument && INSTRUMENT_VALUES.includes(searchParams.instrument)
      ? searchParams.instrument
      : undefined;

  return <OnboardingFlow initialInstrument={instrument} />;
}
