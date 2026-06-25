"use client";

import { useState } from "react";
import { TableShell, Th, Td, StatusPill, toneForStatus } from "./Table";
import { MOCK_CLASS_LOG } from "@/lib/mock-crm";
import type { ClassLog, ClassStatus } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function ClassTracker() {
  // Local state only for v1. TODO(integration): persist to backend.
  const [rows, setRows] = useState<ClassLog[]>(MOCK_CLASS_LOG);

  function setStatus(id: string, status: ClassStatus) {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  }

  function setRemark(id: string, remarks: string) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, remarks } : r)));
  }

  return (
    <TableShell
      toolbar={
        <>
          <span className="text-sm text-ink/50">{rows.length} classes</span>
          <span className="ml-auto text-xs text-ink/40">
            Actions update local state only (v1)
          </span>
        </>
      }
    >
      <thead className="border-b border-hairline bg-paper/60">
        <tr>
          <Th>Date</Th>
          <Th>Student</Th>
          <Th>Teacher</Th>
          <Th>Instrument</Th>
          <Th className="text-right">Class #</Th>
          <Th className="text-right">Duration</Th>
          <Th>Status</Th>
          <Th>Remarks</Th>
          <Th>Actions</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {rows.map((c) => (
          <tr key={c.id} className="hover:bg-paper/50">
            <Td>{formatDate(c.date)}</Td>
            <Td className="font-medium text-ink">{c.student}</Td>
            <Td>{c.teacher}</Td>
            <Td>{c.instrument}</Td>
            <Td className="text-right">{c.classNumber}</Td>
            <Td className="text-right">{c.duration}m</Td>
            <Td>
              <StatusPill tone={toneForStatus(c.status)}>{c.status}</StatusPill>
            </Td>
            <Td className="min-w-[200px] whitespace-normal">
              <input
                value={c.remarks}
                onChange={(e) => setRemark(c.id, e.target.value)}
                placeholder="Add remarks…"
                aria-label={`Remarks for ${c.student}`}
                className="w-full rounded-lg border border-hairline bg-paper px-2.5 py-1.5 text-xs text-ink focus:border-ink focus:outline-none"
              />
            </Td>
            <Td>
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "Completed")}
                  className="rounded-lg bg-feature-green/10 px-2.5 py-1 text-xs font-semibold text-feature-green hover:bg-feature-green/20"
                >
                  Complete
                </button>
                <button
                  type="button"
                  onClick={() => setStatus(c.id, "Cancelled")}
                  className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Cancel
                </button>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
