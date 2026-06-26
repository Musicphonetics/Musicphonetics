"use client";

import { useMemo, useState } from "react";
import { TrustSubsection } from "./TrustSubsection";
import { TrustIcon } from "./TrustIcon";
import { LIBRARY, DOC_CATEGORIES } from "@/lib/trust";
import { cn } from "@/lib/utils";

export function TransparencyLibrary() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("");

  const results = useMemo(() => {
    const query = q.trim().toLowerCase();
    return LIBRARY.filter(
      (d) =>
        (!cat || d.category === cat) &&
        (!query || `${d.title} ${d.kind} ${d.category}`.toLowerCase().includes(query))
    );
  }, [q, cat]);

  return (
    <TrustSubsection
      id="transparency"
      eyebrow="Section 04 · Transparency Centre"
      title="A searchable library of everything we stand on."
      intro="Categorised, searchable documentation — designed to open in a clean reader once published."
    >
      {/* Search + filters */}
      <div className="mp-glass rounded-2xl p-4 sm:p-5">
        <div className="relative">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/40">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.7" />
            <path d="M20 20l-3-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search documents, policies, certificates…"
            aria-label="Search the transparency library"
            className="w-full rounded-xl border border-white/12 bg-white/5 py-3 pl-11 pr-4 text-sm text-paper placeholder:text-paper/40 focus:border-gold/50 focus:outline-none"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <FilterChip active={cat === ""} onClick={() => setCat("")}>All</FilterChip>
          {DOC_CATEGORIES.map((c) => (
            <FilterChip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterChip>
          ))}
        </div>
      </div>

      <div className="mt-3 text-sm text-paper/50">{results.length} documents</div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((d) => (
          <button
            key={d.title}
            type="button"
            title="Opens in reader once published"
            className="group mp-glass flex items-center gap-3 rounded-xl p-4 text-left transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/40"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/12 bg-white/5 text-gold">
              <TrustIcon icon={d.icon} size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-paper">{d.title}</p>
              <p className="text-xs text-paper/45">{d.kind} · {d.category}</p>
            </div>
            <span className="text-paper/30 transition-transform group-hover:translate-x-0.5">
              <TrustIcon icon="privacy" size={14} />
            </span>
          </button>
        ))}
        {results.length === 0 && (
          <p className="col-span-full rounded-xl border border-white/10 p-8 text-center text-paper/50">
            No documents match your search.
          </p>
        )}
      </div>
    </TrustSubsection>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
        active
          ? "border-gold bg-gold/15 text-gold"
          : "border-white/12 bg-white/5 text-paper/60 hover:text-paper"
      )}
    >
      {children}
    </button>
  );
}
