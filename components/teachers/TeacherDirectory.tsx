"use client";

import { useMemo, useState } from "react";
import { TeacherCard } from "./TeacherCard";
import { Button } from "@/components/ui/Button";
import { TEACHER_FACETS } from "@/lib/teachers";
import type { TeacherProfile } from "@/lib/teachers";
import { whatsappLink } from "@/lib/data";
import { cn } from "@/lib/utils";

interface Filters {
  q: string;
  instrument: string;
  city: string;
  level: string;
  language: string;
  ageGroup: string;
  mode: string;
}

const EMPTY: Filters = {
  q: "",
  instrument: "",
  city: "",
  level: "",
  language: "",
  ageGroup: "",
  mode: "",
};

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-ink/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-xl border border-hairline bg-white px-3 py-2.5 text-sm text-ink focus:border-ink focus:outline-none"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Scalable teacher discovery — search + facet filters over any teacher set.
 * Built to handle thousands of teachers without changing the UX.
 */
export function TeacherDirectory({
  teachers,
  showCityFilter = true,
}: {
  teachers: TeacherProfile[];
  showCityFilter?: boolean;
}) {
  const [f, setF] = useState<Filters>(EMPTY);
  const set = (key: keyof Filters) => (v: string) =>
    setF((prev) => ({ ...prev, [key]: v }));

  const results = useMemo(() => {
    const q = f.q.trim().toLowerCase();
    return teachers.filter((t) => {
      if (
        q &&
        !`${t.name} ${t.instruments.join(" ")} ${t.cities.join(" ")} ${t.qualification}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      if (f.instrument && !t.instruments.includes(f.instrument)) return false;
      if (f.city && !t.cities.includes(f.city)) return false;
      if (f.level && !t.levels.includes(f.level as never)) return false;
      if (f.language && !t.languages.includes(f.language)) return false;
      if (f.ageGroup && !t.ageGroups.includes(f.ageGroup as never)) return false;
      if (f.mode && !t.modes.includes(f.mode as never)) return false;
      return true;
    });
  }, [teachers, f]);

  const hasFilters = Object.values(f).some(Boolean);

  return (
    <div>
      {/* Search */}
      <div className="rounded-2xl border border-hairline bg-paper p-4 shadow-card sm:p-5">
        <div className="relative">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40"
          >
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={f.q}
            onChange={(e) => set("q")(e.target.value)}
            placeholder="Search by name, instrument, area…"
            aria-label="Search teachers"
            className="w-full rounded-xl border border-hairline bg-white py-3 pl-11 pr-4 text-sm text-ink placeholder:text-ink/40 focus:border-ink focus:outline-none"
          />
        </div>

        {/* Facets */}
        <div
          className={cn(
            "mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3",
            showCityFilter ? "lg:grid-cols-6" : "lg:grid-cols-5"
          )}
        >
          <Select label="Instrument" value={f.instrument} options={TEACHER_FACETS.instruments} onChange={set("instrument")} />
          {showCityFilter && (
            <Select label="City / Area" value={f.city} options={TEACHER_FACETS.cities} onChange={set("city")} />
          )}
          <Select label="Level" value={f.level} options={TEACHER_FACETS.levels} onChange={set("level")} />
          <Select label="Language" value={f.language} options={TEACHER_FACETS.languages} onChange={set("language")} />
          <Select label="Age group" value={f.ageGroup} options={TEACHER_FACETS.ageGroups} onChange={set("ageGroup")} />
          <Select label="Mode" value={f.mode} options={TEACHER_FACETS.modes} onChange={set("mode")} />
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-sm text-ink/55">
            {results.length} teacher{results.length === 1 ? "" : "s"}
          </span>
          {hasFilters && (
            <button
              type="button"
              onClick={() => setF(EMPTY)}
              className="text-sm font-semibold text-deep-gold hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Results */}
      {results.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((t) => (
            <TeacherCard key={t.id} teacher={t} />
          ))}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-hairline bg-white p-10 text-center">
          <p className="text-ink/70">
            No teachers match those filters yet.
          </p>
          <p className="mt-1 text-sm text-ink/50">
            Tell us what you&apos;re looking for and we&apos;ll match you
            personally.
          </p>
          <div className="mt-5 flex justify-center">
            <Button href={whatsappLink()} external variant="primary">
              Enquire on WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
