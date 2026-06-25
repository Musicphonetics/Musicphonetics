import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { TeacherProfile } from "@/lib/teachers";

export function TeacherCard({ teacher }: { teacher: TeacherProfile }) {
  return (
    <Link
      href={`/teachers/profile/${teacher.slug}`}
      className="group block focus-visible:outline-none"
    >
      <Card hover className="flex h-full flex-col">
        <ImagePlaceholder label="Teacher headshot" aspect="square" className="mb-5" />
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-ink group-hover:text-deep-gold">
            {teacher.name}
          </h3>
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
          {teacher.instruments.map((inst) => (
            <Badge key={inst} tone="gold">
              {inst}
            </Badge>
          ))}
        </div>
        <p className="mt-4 flex-1 text-sm leading-relaxed text-ink/65">
          {teacher.bio}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-hairline pt-4 text-sm">
          <span className="text-ink/60">{teacher.cities.join(", ")}</span>
          <span className="font-medium text-ink">{teacher.experience}</span>
        </div>
        <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-deep-gold">
          View profile
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
      </Card>
    </Link>
  );
}
