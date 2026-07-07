"use client";

import { useMemo, useState, type ReactNode } from "react";

export interface Col<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  csv?: (row: T) => string | number;
}

function toCsv<T>(cols: Col<T>[], rows: T[]): string {
  const head = cols.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((r) =>
    cols.map((c) => {
      const v = c.csv ? c.csv(r) : (r as Record<string, unknown>)[c.key];
      return `"${String(v ?? "").replace(/"/g, '""')}"`;
    }).join(",")
  );
  return [head, ...body].join("\n");
}

export function OwnerTable<T extends Record<string, unknown>>({
  cols, rows, searchKeys, filename, title,
}: { cols: Col<T>[]; rows: T[]; searchKeys: (keyof T)[]; filename: string; title?: string }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) => searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(needle)));
  }, [q, rows, searchKeys]);

  function download() {
    const blob = new Blob([toCsv(cols, filtered)], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${filename}.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${title || "records"}…`}
          className="min-w-[200px] flex-1 rounded-xl border border-hairline bg-white px-4 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-gold focus:outline-none" />
        <span className="text-xs text-ink/55">{filtered.length} of {rows.length}</span>
        <button onClick={download} className="rounded-full border border-hairline px-4 py-2 text-sm font-semibold text-ink hover:border-ink">
          Export CSV
        </button>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-hairline bg-white">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-hairline bg-paper text-xs uppercase tracking-wide text-ink/60">
            <tr>{cols.map((c) => <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={cols.length} className="px-4 py-8 text-center text-ink/50">No records.</td></tr>
            ) : filtered.map((r, i) => (
              <tr key={i} className="border-b border-hairline/60 last:border-0">
                {cols.map((c) => (
                  <td key={c.key} className="px-4 py-3 text-ink/80">
                    {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "-")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
