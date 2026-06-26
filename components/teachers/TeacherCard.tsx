import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { whatsappLink, whatsappTrialLink } from "@/lib/data";
import type { TeacherProfile } from "@/lib/teachers";

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink/45">{label}</dt>
      <dd className="text-right font-medium text-ink">{value}</dd>
    </div>
  );
}

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <div className="flex h-full flex-col rounded-2xl border border-hairline bg-white p-6 shadow-card transition-all hover:-translate-y-1 hover:shadow-card-hover">
      <div className="flex items-start justify-between gap-2">
        <Link
          href={`/teachers/profile/${teacher.slug}`}
          className="font-display text-lg font-semibold text-ink hover:text-deep-gold"
        >
          {teacher.name}
        </Link>
        {teacher.verified && (
          <Badge tone="green">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l4 4 10-10" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified
          </Badge>
        )}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {teacher.instruments.map((i) => (
          <Badge key={i} tone="gold">
            {i}
          </Badge>
        ))}
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-hairline pt-4 text-sm">
        <Meta label="Location" value={teacher.cities.join(" / ")} />
        <Meta label="Experience" value={teacher.experience} />
        <Meta label="Teaches" value={teacher.ageGroups.join(", ")} />
        <Meta label="Pathways" value={teacher.examPathways.join(", ")} />
      </dl>

      <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/60">{teacher.bio}</p>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Button
          href={whatsappTrialLink()}
          external
          variant="primary"
          className="w-full sm:flex-1"
        >
          Book a Trial
        </Button>
        <Button
          href={whatsappLink(
            `Hi Musicphonetics, I'd like to enquire about ${teacher.name} (${teacher.instruments.join(", ")}).`
          )}
          external
          variant="secondary"
          className="w-full sm:flex-1"
        >
          Enquire
        </Button>
      </div>
    </div>
  );
}
