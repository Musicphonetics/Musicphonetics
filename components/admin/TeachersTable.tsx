"use client";

import { TableShell, Th, Td, StatusPill, toneForStatus } from "./Table";
import { MOCK_TEACHERS } from "@/lib/mock-crm";

export function TeachersTable() {
  return (
    <TableShell
      toolbar={
        <span className="text-sm text-ink/50">
          {MOCK_TEACHERS.length} teachers
        </span>
      }
    >
      <thead className="border-b border-hairline bg-paper/60">
        <tr>
          <Th>Teacher ID</Th>
          <Th>Name</Th>
          <Th>Instruments</Th>
          <Th>Areas</Th>
          <Th className="text-right">Capacity</Th>
          <Th className="text-right">Rating</Th>
          <Th>Active</Th>
          <Th>Verification</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {MOCK_TEACHERS.map((t) => {
          const load = t.maxStudents
            ? Math.round((t.currentStudents / t.maxStudents) * 100)
            : 0;
          return (
            <tr key={t.id} className="hover:bg-paper/50">
              <Td className="font-mono text-xs text-ink/60">{t.id}</Td>
              <Td className="font-medium text-ink">{t.name}</Td>
              <Td>{t.instruments.join(", ")}</Td>
              <Td>{t.areas.join(", ")}</Td>
              <Td className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span>
                    {t.currentStudents}/{t.maxStudents}
                  </span>
                  <span className="hidden h-2 w-16 overflow-hidden rounded-full bg-mist sm:block">
                    <span
                      className="block h-full rounded-full bg-gold"
                      style={{ width: `${load}%` }}
                    />
                  </span>
                </div>
              </Td>
              <Td className="text-right">{t.rating > 0 ? `★ ${t.rating.toFixed(1)}` : "-"}</Td>
              <Td>
                <StatusPill tone={t.active ? "green" : "neutral"}>
                  {t.active ? "Active" : "Inactive"}
                </StatusPill>
              </Td>
              <Td>
                <StatusPill tone={toneForStatus(t.verificationStatus)}>
                  {t.verificationStatus}
                </StatusPill>
              </Td>
            </tr>
          );
        })}
      </tbody>
    </TableShell>
  );
}
