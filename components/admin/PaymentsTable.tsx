"use client";

import { TableShell, Th, Td, StatusPill, toneForStatus } from "./Table";
import { MOCK_PAYMENTS } from "@/lib/mock-crm";
import { formatINR, formatDate } from "@/lib/utils";

export function PaymentsTable() {
  const total = MOCK_PAYMENTS.filter((p) => p.status === "Paid").reduce(
    (sum, p) => sum + p.amount,
    0
  );

  return (
    <TableShell
      toolbar={
        <>
          <span className="text-sm text-ink/50">
            {MOCK_PAYMENTS.length} payments
          </span>
          <span className="ml-auto text-sm font-semibold text-ink">
            Collected: {formatINR(total)}
          </span>
        </>
      }
    >
      <thead className="border-b border-hairline bg-paper/60">
        <tr>
          <Th>Date</Th>
          <Th>Student</Th>
          <Th className="text-right">Amount</Th>
          <Th>Package</Th>
          <Th>Mode</Th>
          <Th>Status</Th>
          <Th>Invoice</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {MOCK_PAYMENTS.map((p) => (
          <tr key={p.id} className="hover:bg-paper/50">
            <Td>{formatDate(p.date)}</Td>
            <Td className="font-medium text-ink">{p.student}</Td>
            <Td className="text-right font-semibold text-ink">
              {formatINR(p.amount)}
            </Td>
            <Td>{p.packageName}</Td>
            <Td>{p.mode}</Td>
            <Td>
              <StatusPill tone={toneForStatus(p.status)}>{p.status}</StatusPill>
            </Td>
            <Td>
              {/* TODO(integration): link to generated invoice PDF */}
              <span className="text-ink/40">Invoice (placeholder)</span>
            </Td>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}
