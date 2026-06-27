import { STANDARDS } from "./standards-data";

// Internal operational manuals are not shown publicly. The institution still
// maintains 23 standards (used for the "Built on 23 standards" trust claim);
// the public library shows only parent-facing standards.
export const INTERNAL_SLUGS = new Set<string>([
  "operations-manual",
  "business-sop",
  "crisis-emergency",
  "student-journey",
]);

export const PUBLIC_STANDARDS = STANDARDS.filter((s) => !INTERNAL_SLUGS.has(s.slug));

export function isPublicStandard(slug: string): boolean {
  return !INTERNAL_SLUGS.has(slug);
}
