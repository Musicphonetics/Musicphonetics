"use client";

import { useMemo, useState } from "react";
import { TableShell, Th, Td, StatusPill, toneForStatus } from "./Table";
import { MOCK_PEOPLE } from "@/lib/mock-crm";

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-ink/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-hairline bg-paper px-2.5 py-1.5 text-sm text-ink focus:border-ink focus:outline-none"
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

const uniq = (arr: string[]) => [...new Set(arr)].sort();

export function PeopleTable() {
  const [status, setStatus] = useState("");
  const [source, setSource] = useState("");
  const [interest, setInterest] = useState("");
  const [instrument, setInstrument] = useState("");
  const [area, setArea] = useState("");

  const filtered = useMemo(
    () =>
      MOCK_PEOPLE.filter(
        (p) =>
          (!status || p.currentStatus === status) &&
          (!source || p.leadSource === source) &&
          (!interest || p.interestType === interest) &&
          (!instrument || p.instrument === instrument) &&
          (!area || p.area === area)
      ),
    [status, source, interest, instrument, area]
  );

  return (
    <TableShell
      toolbar={
        <>
          <FilterSelect label="Status" value={status} onChange={setStatus} options={uniq(MOCK_PEOPLE.map((p) => p.currentStatus))} />
          <FilterSelect label="Source" value={source} onChange={setSource} options={uniq(MOCK_PEOPLE.map((p) => p.leadSource))} />
          <FilterSelect label="Interest" value={interest} onChange={setInterest} options={uniq(MOCK_PEOPLE.map((p) => p.interestType))} />
          <FilterSelect label="Instrument" value={instrument} onChange={setInstrument} options={uniq(MOCK_PEOPLE.map((p) => p.instrument))} />
          <FilterSelect label="Area" value={area} onChange={setArea} options={uniq(MOCK_PEOPLE.map((p) => p.area))} />
          <span className="ml-auto text-sm text-ink/50">
            {filtered.length} of {MOCK_PEOPLE.length}
          </span>
        </>
      }
    >
      <thead className="border-b border-hairline bg-paper/60">
        <tr>
          <Th>Person ID</Th>
          <Th>Name</Th>
          <Th>Phone</Th>
          <Th>Source</Th>
          <Th>Awareness</Th>
          <Th>Interest</Th>
          <Th>Instrument</Th>
          <Th>Area</Th>
          <Th>Experience</Th>
          <Th>Goal</Th>
          <Th>Recommended</Th>
          <Th>Package</Th>
          <Th>Status</Th>
          <Th>Payment</Th>
          <Th>Notes</Th>
        </tr>
      </thead>
      <tbody className="divide-y divide-hairline">
        {filtered.map((p) => (
          <tr key={p.id} className="hover:bg-paper/50">
            <Td className="font-mono text-xs text-ink/60">{p.id}</Td>
            <Td className="font-medium text-ink">{p.name}</Td>
            <Td>{p.phone}</Td>
            <Td>{p.leadSource}</Td>
            <Td>{p.brandAwareness}</Td>
            <Td>{p.interestType}</Td>
            <Td>{p.instrument}</Td>
            <Td>{p.area}</Td>
            <Td>{p.experience}</Td>
            <Td className="max-w-[200px] whitespace-normal text-ink/60">{p.goal}</Td>
            <Td>{p.recommendedPath || "—"}</Td>
            <Td>{p.selectedPackage || "—"}</Td>
            <Td>
              <StatusPill tone={toneForStatus(p.currentStatus)}>
                {p.currentStatus}
              </StatusPill>
            </Td>
            <Td>
              <StatusPill tone={toneForStatus(p.paymentStatus)}>
                {p.paymentStatus}
              </StatusPill>
            </Td>
            <Td className="max-w-[220px] whitespace-normal text-ink/55">{p.notes}</Td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={15} className="px-4 py-10 text-center text-ink/50">
              No people match these filters.
            </td>
          </tr>
        )}
      </tbody>
    </TableShell>
  );
}
