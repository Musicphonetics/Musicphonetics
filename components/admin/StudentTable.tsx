"use client";

import { TableShell, Th, Td, StatusPill, toneForStatus } from "./Table";
import { MOCK_STUDENTS } from "@/lib/mock-crm";
import { formatINR, formatDate } from "@/lib/utils";

export function StudentTable() {
  return (
    <TableShell
      toolbar={
        <span className="text-sm text-ink/50">
          {MOCK_STUDENTS.length} students
        </span>
      }
    >
      <thead className="border-b border-hairline bg-paper/60">
        <tr>
          <Th>Student ID</Th>
          <Th>Student</Th>
          <Th>Parent</Th>
          <Th>Teacher</Th>
          <Th>Instrument</Th>
          <Th>Package</Th>
          <Th className="text-right">Purchased</Th>
          <Th className="text-right">Done</Th>
          <Th className="text-right">Remaining</Th>
          <Th>Joining</Th>
          <Th>Renewal</Th>
          <Th className="text-right">Fee Paid</Th>
          <Th className="text-right">Balance</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {MOCK_STUDENTS.map((s) => (
          <tr key={s.id} className="hover:bg-paper/50">
            <Td className="font-mono text-xs text-ink/60">{s.id}</Td>
            <Td className="font-medium text-ink">{s.name}</Td>
            <Td>{s.parentName}</Td>
            <Td>{s.teacher}</Td>
            <Td>{s.instrument}</Td>
            <Td>{s.packageName}</Td>
            <Td className="text-right">{s.classesPurchased}</Td>
            <Td className="text-right">{s.classesDone}</Td>
            <Td className="text-right font-semibold text-ink">
              {s.classesPurchased - s.classesDone}
            </Td>
            <Td>{formatDate(s.joiningDate)}</Td>
            <Td>{formatDate(s.renewalDate)}</Td>
            <Td className="text-right">{formatINR(s.feePaid)}</Td>
            <Td className="text-right">
              {s.balance > 0 ? (
                <span className="font-semibold text-deep-gold">
                  {formatINR(s.balance)}
                </span>
              ) : (
                formatINR(0)
              )}
            </Td>
            <Td>
              <StatusPill tone={toneForStatus(s.status)}>{s.status}</StatusPill>
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
